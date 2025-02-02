import * as TOML from "npm:smol-toml";
import { ensureDirSync } from "https://deno.land/std@0.218.2/fs/mod.ts";

export class Config {
    public data: Record<string, TOML.TomlPrimitive>;
    public args: {
        [x: string]: unknown;
        old?: string | undefined;
        new?: string | undefined;
        path?: string | undefined;
        commits?: string | undefined;
        _: Array<string | number>;
    } | undefined
    static readonly defaultConfig = {
        modpack_name: "",
        default_folder: "./modpack_data",
        markdown: {
            title: {text: "Changelog", prefix: "", suffix: ""},
            version: {text: "$VERSION", prefix: "📦 ", suffix: ""},
            notes: {text: "General changes and notes", prefix: "📰 ", suffix: ""},
            mods: {text: "Mods", prefix: "🛠️ ", suffix: ""},
            recipes: {text: "Recipes", prefix: "🍳 ", suffix: ""},
            tags: {text: "Tags", prefix: "🏷️ ", suffix: ""},
            registries: {text: "Registries", prefix: "✍️ ", suffix: ""},
            loot_table: {text: "Loot Table", prefix: "🗝️ ", suffix: ""},
        },
        allow_list: {
            registries: [
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
                "worldgen/structure"
              ]
        },
        deny_list: {},
        ignore_changes_list: {
            recipes: {
                keys: ["fabric:type"]
            },
            loot_tables: {
                keys: ["random_sequence"]
            }
        },
        github: {
            owner: "",
            repo: "",
            commit_message_exclude_filter: ["Merge branch", "Merge pull request"]
        }
    }
    private constructor(path: string){
        this.data = Config.readToml(path)
    }

    public static create(path: string){
        let file = false
        try {
            file = Deno.statSync(path).isFile
        } catch (error) {
            //@ts-ignore unknown type
            if (error.name == "NotFound"){
                ensureDirSync(path.substring(0,path.lastIndexOf("/")))
                this.writeToml(path, Config.defaultConfig)
            }
        }
        return new Config(path)
    }

    static readToml(path:string) {
        return TOML.parse(Deno.readTextFileSync(path))
    }
    
    static writeToml(path:string, data: Record<string, unknown>) {
        return Deno.writeTextFileSync(path, TOML.stringify(data))
    }
}
