// @deno-types="npm:@types/json-diff"
import { diff, diffString } from "npm:json-diff";
import { Octokit } from "npm:@octokit/core";
import type { Modpack } from "./modpack.ts";
import type { Entry, EntryType, Mod } from "./types.ts";
import type { ContentEntry, AllowList } from "./types.ts";
import type { Config } from "./config.ts";
import { AllTheLogs } from "../main.ts";

export class CompareModpacks {

  public readonly oldModpack: Modpack;
  public readonly newModpack: Modpack;
  public content: Map<string, string | undefined>;
  public entries: Map<EntryType, Entry>;

  public config: Config;

  private readonly github = new Octokit({auth: Deno.env.get("GITHUB_AUTH")})

  public githubCommits: string[] = []
  protected filterRegistries = [
    "block_entity_type",
    "block",
    "dimension",
    "enchantment",
    "entity_type",
    "fluid",
    "item",
    "mob_effect",
    "potion",
    "recipe_type",
    "villager_profession",
    "worldgen/biome",
    "worldgen/feature",
    "worldgen/placed_feature",
    "worldgen/structure",
  ];

  constructor(oldModpack: Modpack, newModpack: Modpack, config: Config) {
    this.oldModpack = oldModpack;
    this.newModpack = newModpack;
    this.content = new Map();
    this.entries = new Map();
    this.config = config;
  }

  public async generateAllContent(){
    let ghConfig = this.config.data.github.valueOf() as Record<string,string>
    let ghCommits = this.config.args?.commits
    let filterRegistries = (this.config.data.allow_list as AllowList).registries ?? []
    this.generateContent("loot_tables", this.oldModpack.lootTables, this.newModpack.lootTables, false)
    AllTheLogs.LOGGER.debug(`Reading registries: ${filterRegistries.join(", ")}`)
    this.generateContent("registries", this.oldModpack.getRegistries(filterRegistries), this.newModpack.getRegistries(filterRegistries), true, false)
    // this.generateContent("custom_recipes", this.oldModpack.customRecipes, this.newModpack.customRecipes, false)
    this.generateContent("original_recipes", this.oldModpack.originalRecipes, this.newModpack.originalRecipes, false)
    this.generateModsContent()
    this.generateContent("tags", this.oldModpack.tags, this.newModpack.tags, false, false)
    if (ghCommits){
      AllTheLogs.LOGGER.info(`Using the following Github settings:`)
      AllTheLogs.LOGGER.info(`Owner: ${ghConfig.owner}, Repo: ${ghConfig.repo}, Base...Head: ${ghCommits}`)
      await this.fetchCommits(ghConfig.owner, ghConfig.repo, ghCommits)
    } else AllTheLogs.LOGGER.info(`Github info not set, skipping.`)
  }

  protected generateModsContent(){
    const oldCollectionMap = new Map() as Map<string,Mod>
    const newCollectionMap = new Map() as Map<string,Mod>
    this.oldModpack.mods.forEach(mod => oldCollectionMap.set(mod.id, mod))
    this.newModpack.mods.forEach(mod => newCollectionMap.set(mod.id, mod))
    const added = [...newCollectionMap.keys()].filter(mods => !oldCollectionMap.has(mods))
    const removed = [...oldCollectionMap.keys()].filter(mods => !newCollectionMap.has(mods))
    const changed = [...newCollectionMap.keys()].filter((mods) => oldCollectionMap.has(mods) && oldCollectionMap.get(mods)?.version != newCollectionMap.get(mods)?.version)
    this.entries.set("mods", {added, removed, changed})
    AllTheLogs.LOGGER.info(`Generating content for ${added.length + removed.length + changed.length} mods...`)
    added.sort().forEach(modId => {
      const mod = newCollectionMap.get(modId)!
      this.content.set(modId, `${mod.name} (${mod.version})`)
    })
    removed.sort().forEach(modId => {
      const mod = oldCollectionMap.get(modId)!
      this.content.set(modId, `${mod.name} (${mod.version})`)
    })
    changed.sort().forEach(modId => {
      const newMod = newCollectionMap.get(modId)!
      const oldMod = oldCollectionMap.get(modId)!
      this.content.set(modId, `${oldMod.name} (${oldMod.version}) -> (${newMod.version})`)
    })
  }

  protected generateContent(
    type: EntryType,
    oldCollection: string[],
    newCollection: string[], keysOnly: boolean, full: boolean = true
  ) {
    const newCollectionSet = new Set(newCollection);
    const oldCollectionSet = new Set(oldCollection);
    AllTheLogs.LOGGER.info(`${type} - comparing ${oldCollectionSet.size} vs ${newCollectionSet.size}  items...`)
    const removed = this.leftExclusive(oldCollectionSet, newCollectionSet, keysOnly)
    const added = this.rightExclusive(oldCollectionSet, newCollectionSet, keysOnly)
    const changed = this.innerJoin(oldCollectionSet, newCollectionSet, keysOnly, full)
    this.content = new Map([...this.content, ...removed.content, ...added.content, ...changed.content])
    this.entries.set(type, {added: added.entries, removed: removed.entries, changed: changed.entries})
  }

  protected rightExclusive(oldCollection: Set<string>, newCollection:Set<string>, keysOnly:boolean): ContentEntry{
    const content:Map<string, string | undefined> = new Map()
    const entries:string[]= [...newCollection].filter((entry) =>
    !oldCollection.has(entry)
  );
    entries.forEach(entry => {
      content.set(
        entry,
        diffString(undefined, keysOnly ? Object.keys(this.newModpack.readFileIndex(entry) as string[]) : this.newModpack.readFileIndex(entry), {
          color: false,
        }),
      )
    })
    return {entries, content}
  }

  protected leftExclusive(oldCollection: Set<string>, newCollection:Set<string>, keysOnly:boolean): ContentEntry{
    const content:Map<string, string | undefined> = new Map()
    const entries:string[]= [...oldCollection].filter((entry) =>
    !newCollection.has(entry)
  );
    entries.forEach(entry => {
      content.set(
        entry,
        // deno-lint-ignore no-explicit-any
        diffString(keysOnly ? Object.keys(this.oldModpack.readFileIndex(entry) as any): this.oldModpack.readFileIndex(entry), undefined, {
          color: false
        }),
      )
    })
    return {entries, content}
  }

  protected innerJoin(oldCollection: Set<string>, newCollection:Set<string>, keysOnly:boolean, full: boolean = true): ContentEntry {
    const content:Map<string, string | undefined> = new Map()
    const entries:string[]= []
    newCollection.forEach(entry => {
      if (oldCollection.has(entry)) {
        const isDiff = diff(
          keysOnly ? Object.keys(this.oldModpack.readFileIndex(entry) as string[]) : this.oldModpack.readFileIndex(entry),
          keysOnly ? Object.keys(this.newModpack.readFileIndex(entry) as string[]) : this.newModpack.readFileIndex(entry),
          {excludeKeys: ["fabric:type", "random_sequence"]},
        )
        isDiff && content.set(entry, this.validateDiff(diffString(
          keysOnly ? Object.keys(this.oldModpack.readFileIndex(entry) as string[]) : this.oldModpack.readFileIndex(entry),
          keysOnly ? Object.keys(this.newModpack.readFileIndex(entry) as string[]) : this.newModpack.readFileIndex(entry),
          { color: false , sort: true, maxElisions: 0, full: full},
        )))
        content.get(entry) && entries.push(entry)
      }
    })
    return {entries, content}
  }

  protected async fetchCommits(owner:string, repo:string, basehead:string){
    const banCommit = ["Merge branch", "Merge pull request", "release"]
    await this.github.request('GET /repos/{owner}/{repo}/compare/{basehead}', {
      owner: owner,
      repo: repo,
      basehead: basehead,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }).then(res => {
      res.data.commits.forEach(commits => commits.commit.message.split("\n").forEach(message => {
        !banCommit.some(val => message.includes(val)) && message != "" && this.githubCommits.push(message)
      }))
    })
  }

  protected validateDiff(text: string): string|undefined{
    const changes = ["+", "-"]
    const validDiff = text.split("\n").some(val => changes.some(signal => val.startsWith(signal)))
    return validDiff ? text : undefined
  }
}
