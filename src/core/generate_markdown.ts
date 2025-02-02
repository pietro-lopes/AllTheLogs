import type { Header, Content } from "./types.ts"
import type { CompareModpacks } from "./compare_modpacks.ts";
import type { Markdown } from "./types.ts"
import { AllTheLogs } from "../main.ts";
export class GenerateMarkdown {
    public comparison: CompareModpacks;

    constructor(comparison: CompareModpacks){
        this.comparison = comparison
    }

    public async generateAllContent(){
        await this.comparison.generateAllContent()
        // ...
    }

    public async generateMarkDown(){
        const config = this.comparison.config.data
        const markdown = config.markdown as unknown as Markdown
        await this.generateAllContent()
        const gm = GenerateMarkdown
        const content = {content: ""}
        gm.addHeader(content, "#", markdown.title.text, markdown.title.prefix, markdown.title.suffix)
        gm.addHeader(content, "#", (markdown.version.text == "$VERSION" ? this.comparison.newModpack.folder : markdown.version.text), markdown.version.prefix, markdown.version.suffix)
        gm.addHeader(content, "##", markdown.notes.text, markdown.notes.prefix, markdown.notes.suffix)
        content.content += "Summary of changes here!\n\n"
        if (this.comparison.githubCommits.length > 0){
            gm.wrapIntoDetails(content, gm.convertIntoList(this.comparison.githubCommits), "Github Commits :octocat:", true, true)
        }
        gm.addHorizontalRule(content)
        gm.addHeader(content, "##", markdown.mods.text, markdown.mods.prefix, markdown.mods.suffix)

        let modsAdded = this.comparison.entries.get("mods")?.added!
        if (modsAdded.length > 0){
            let modList = gm.convertIntoList(modsAdded.map(mod => this.comparison.content.get(mod) ?? ""))
            gm.wrapIntoDetails(content, modList, `Added (${modsAdded.length})`, true)
        }
        let modsUpdated = this.comparison.entries.get("mods")?.changed!
        if (modsUpdated.length > 0){
            let modList = gm.convertIntoList(modsUpdated.map(mod => this.comparison.content.get(mod) ?? ""))
            gm.wrapIntoDetails(content, modList, `Updated (${modsUpdated.length})`, modsUpdated.length < 10)
        }
        let modsRemoved = this.comparison.entries.get("mods")?.removed!
        if (modsRemoved.length > 0){
            let modList = gm.convertIntoList(modsRemoved.map(mod => this.comparison.content.get(mod) ?? ""))
            gm.wrapIntoDetails(content, modList, `Removed (${modsRemoved.length})`, true)
        }
        gm.addHeader(content, "##", markdown.recipes.text, markdown.recipes.prefix, markdown.recipes.suffix)
        let recipesAdded = this.comparison.entries.get("original_recipes")?.added!
        if (recipesAdded.length > 0){
            const recipesContent: Content = {content: ""}
            recipesAdded.forEach(recipe => {
                const recipeContent: Content = {content: ""}
                gm.wrapIntoDiff(recipeContent, this.comparison.content.get(recipe) ?? "")
                gm.wrapIntoDetails(recipesContent, recipeContent.content, recipe.replace("recipes/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, recipesContent.content, `Added (${recipesAdded.length})`, recipesAdded.length < 10, true)
        }
        let recipesChanged = this.comparison.entries.get("original_recipes")?.changed!
        if (recipesChanged.length > 0){
            const recipesContent: Content = {content: ""}
            recipesChanged.forEach(recipe => {
                const recipeContent: Content = {content: ""}
                gm.wrapIntoDiff(recipeContent, this.comparison.content.get(recipe) ?? "")
                gm.wrapIntoDetails(recipesContent, recipeContent.content, recipe.replace("recipes/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, recipesContent.content, `Changed (${recipesChanged.length})`, recipesChanged.length < 10, true)
        }
        let recipesRemoved = this.comparison.entries.get("original_recipes")?.removed!
        if (recipesRemoved.length > 0){
            const recipesContent: Content = {content: ""}
            recipesRemoved.forEach(recipe => {
                const recipeContent: Content = {content: ""}
                gm.wrapIntoDiff(recipeContent, this.comparison.content.get(recipe) ?? "")
                gm.wrapIntoDetails(recipesContent, recipeContent.content, recipe.replace("recipes/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, recipesContent.content, `Removed (${recipesRemoved.length})`, recipesRemoved.length < 10, true)
        }
        gm.addHeader(content, "##", markdown.tags.text, markdown.tags.prefix, markdown.tags.suffix)
        let tagsAdded = this.comparison.entries.get("tags")?.added!
        if (tagsAdded.length > 0){
            const tagsContent: Content = {content: ""}
            tagsAdded.forEach(tag => {
                const tagContent: Content = {content: ""}
                gm.wrapIntoDiff(tagContent, this.comparison.content.get(tag) ?? "")
                gm.wrapIntoDetails(tagsContent, tagContent.content, tag.replace("tags/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, tagsContent.content, `Added (${tagsAdded.length})`, tagsAdded.length < 10, true)
        }
        let tagsChanged = this.comparison.entries.get("tags")?.changed!
        if (tagsChanged.length > 0){
            const tagsContent: Content = {content: ""}
            tagsChanged.forEach(tag => {
                const tagContent: Content = {content: ""}
                gm.wrapIntoDiff(tagContent, this.comparison.content.get(tag) ?? "")
                gm.wrapIntoDetails(tagsContent, tagContent.content, tag.replace("tags/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, tagsContent.content, `Changed (${tagsChanged.length})`, tagsChanged.length < 10, true)
        }
        let tagsRemoved = this.comparison.entries.get("tags")?.removed!
        if (tagsRemoved.length > 0){
            const tagsContent: Content = {content: ""}
            tagsRemoved.forEach(tag => {
                const tagContent: Content = {content: ""}
                gm.wrapIntoDiff(tagContent, this.comparison.content.get(tag) ?? "")
                gm.wrapIntoDetails(tagsContent, tagContent.content, tag.replace("tags/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, tagsContent.content, `Removed (${tagsRemoved.length})`, tagsRemoved.length < 10, true)
        }
        gm.addHeader(content, "##", markdown.registries.text, markdown.registries.prefix, markdown.registries.suffix)
        let registriesAdded = this.comparison.entries.get("registries")?.added!
        if (registriesAdded.length > 0){
            const registriesContent: Content = {content: ""}
            registriesAdded.forEach(registry => {
                const registryContent: Content = {content: ""}
                gm.wrapIntoDiff(registryContent, this.comparison.content.get(registry) ?? "")
                gm.wrapIntoDetails(registriesContent, registryContent.content, registry.replace("registries/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, registriesContent.content, `Added (${registriesAdded.length})`, registriesAdded.length < 10, true)
        }
        let registriesChanged = this.comparison.entries.get("registries")?.changed!
        if (registriesChanged.length > 0){
            const registriesContent: Content = {content: ""}
            registriesChanged.forEach(registry => {
                const registryContent: Content = {content: ""}
                gm.wrapIntoDiff(registryContent, this.comparison.content.get(registry) ?? "")
                gm.wrapIntoDetails(registriesContent, registryContent.content, registry.replace("registries/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, registriesContent.content, `Changed (${registriesChanged.length})`, registriesChanged.length < 10, true)
        }
        let registriesRemoved = this.comparison.entries.get("registries")?.removed!
        if (registriesRemoved.length > 0){
            const registriesContent: Content = {content: ""}
            registriesRemoved.forEach(registry => {
                const registryContent: Content = {content: ""}
                gm.wrapIntoDiff(registryContent, this.comparison.content.get(registry) ?? "")
                gm.wrapIntoDetails(registriesContent, registryContent.content, registry.replace("registries/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, registriesContent.content, `Removed (${registriesRemoved.length})`, registriesRemoved.length < 10, true)
        }
        gm.addHeader(content, "##", markdown.loot_table.text, markdown.loot_table.prefix, markdown.loot_table.suffix)
        let lootsAdded = this.comparison.entries.get("loot_tables")?.added!
        if (lootsAdded.length > 0){
            const lootsContent: Content = {content: ""}
            lootsAdded.forEach(loot => {
                const lootContent: Content = {content: ""}
                gm.wrapIntoDiff(lootContent, this.comparison.content.get(loot) ?? "")
                gm.wrapIntoDetails(lootsContent, lootContent.content, loot.replace("loot_tables/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, lootsContent.content, `Added (${lootsAdded.length})`, lootsAdded.length < 10, true)
        }
        let lootsChanged = this.comparison.entries.get("loot_tables")?.changed!
        if (lootsChanged.length > 0){
            const lootsContent: Content = {content: ""}
            lootsChanged.forEach(loot => {
                const lootContent: Content = {content: ""}
                gm.wrapIntoDiff(lootContent, this.comparison.content.get(loot) ?? "")
                gm.wrapIntoDetails(lootsContent, lootContent.content, loot.replace("loot_tables/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, lootsContent.content, `Changed (${lootsChanged.length})`, lootsChanged.length < 10, true)
        }
        let lootsRemoved = this.comparison.entries.get("loot_tables")?.removed!
        if (lootsRemoved.length > 0){
            const lootsContent: Content = {content: ""}
            lootsRemoved.forEach(loot => {
                const lootContent: Content = {content: ""}
                gm.wrapIntoDiff(lootContent, this.comparison.content.get(loot) ?? "")
                gm.wrapIntoDetails(lootsContent, lootContent.content, loot.replace("loot_tables/","").replace(".json",""), false, false)
            })
            gm.wrapIntoDetails(content, lootsContent.content, `Removed (${lootsRemoved.length})`, lootsRemoved.length < 10, true)
        }
        if (typeof this.comparison.config.args?.output == "string"){
            AllTheLogs.LOGGER.info(`Saving file at "${this.comparison.config.args.output}"`)
            Deno.writeTextFileSync(this.comparison.config.args.output, content.content)
        } else {
            let modpackName = this.comparison.config.data.modpack_name.toString()
            let suffix =  `${modpackName ? modpackName + "-" : ""}${this.comparison.oldModpack.folder + "-" + this.comparison.newModpack.folder}`
            let filename = `./CHANGELOG-${suffix}-${Date.now()}.md`
            AllTheLogs.LOGGER.info(`Saving file at "${filename}"`)
            Deno.writeTextFileSync(filename, content.content)
        }
    }

    public static addInline(base:Content, text: string, prefix: string = "", suffix: string = ""){
        base.content += (`${prefix + text + suffix}\n`)
    }

    public static addHeader(base:Content, type: Header, text: string, prefix: string = "", suffix: string = ""){
        this.addInline(base, text, type + " " + prefix, suffix + "\n")
    }

    public static wrapIntoDetails(base:Content, text:string, summary:string, open: boolean = false, blockquote:boolean = false){
        this.addInline(base, text, `<details${open ? " open" : ""}>\n<summary>${summary}</summary>\n${blockquote ? "<blockquote>\n" : ""}\n`, `${blockquote ? "</blockquote>" : ""}\n\n</details>\n`)
    }

    public static wrapIntoDiff(base:Content, text:string){
        this.addInline(base, text, "```diff\n", "\n```")
    }

    public static convertIntoList(elements:string[]): string{
        return elements.map(e => "- " + e).join("\n")
    }

    public static addHorizontalRule(base:Content){
        this.addInline(base, "---\n")
    }
}