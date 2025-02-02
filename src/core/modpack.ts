import { readJsonSync } from "https://deno.land/x/jsonfile@1.0.0/mod.ts";
import type { Mod } from "./types.ts";

export class Modpack {
  public readonly index: string[];
  public readonly customRecipes: string[];
  public readonly lootTables: string[];
  public readonly originalRecipes: string[];
  private registries: string[] | undefined;
  public readonly removedRecipes: string[];
  public readonly tags: string[];
  public readonly path: string;
  public readonly folder: string;
  public readonly mods: Mod[];

  constructor(path: string) {
    this.path = path;
    this.index = this.safeReadJson(
      `${this.path}/export/index.json`,
    ) as string[];
    this.tags = this.filterIndex("tags/");
    this.removedRecipes = this.filterIndex("removed_recipes/");
    this.customRecipes = this.filterIndex("added_recipes/");
    this.lootTables = this.filterIndex("loot_tables/").concat(this.filterIndex("minecraft/loot_table/"));
    this.originalRecipes = this.filterOriginalRecipes();
    this.folder = this.path.split("/").slice(-1)[0]
    this.mods = this.safeReadJson(`${this.path}/export/mods.json`) as Mod[]
  }

  public getRegistries(registries: string[]) {
    if (this.registries) return this.registries;
    return (this.registries = this.filterRegistries(registries));
  }

  private filterOriginalRecipes(){
    const toRemove = new Set(this.customRecipes);
    return this.filterIndex("recipes/").filter(
      (path) => !toRemove.has(path),
    )
  }

  private safeReadJson(path: string) {
    try {
      return readJsonSync(path);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        Deno.exit(1);
      }
    }
  }

  private filterRegistries(registriesFilter: string[]) {
    const allRegistries = this.filterIndex("registries/");
    const toInclude = new Set(
      registriesFilter.map((reg) => `registries/${reg}.json`),
    );
    const filteredRegistries = allRegistries.filter((reg) =>
      toInclude.has(reg)
    );
    // deno-lint-ignore no-constant-condition
    if (false) { // hardcoded debug manually
      let filteredRegistriesSet = new Set(filteredRegistries);
      let a_intersect_b = new Set(
        [...filteredRegistries].filter((x) => !toInclude.has(x)),
      );
      let b_intersect_a = new Set(
        [...toInclude].filter((x) => !filteredRegistriesSet.has(x)),
      );
      console.log(a_intersect_b);
      console.log(b_intersect_a);
    }
    return filteredRegistries;
  }

  private filterIndex(filterString: string) {
    return this.index.filter((path) => path.startsWith(filterString));
  }

  public readFileIndex(entry: string){
    return this.safeReadJson(this.path + "/export/" + entry.replaceAll(":", "/"))
  }
}
