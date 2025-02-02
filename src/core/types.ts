export interface Mod {
  id: string;
  name: string;
  version: string;
}

export interface Markdown {
  title: { text: string; prefix: string; suffix: string };
  version: { text: string; prefix: string; suffix: string };
  notes: { text: string; prefix: string; suffix: string };
  mods: { text: string; prefix: string; suffix: string };
  recipes: { text: string; prefix: string; suffix: string };
  tags: { text: string; prefix: string; suffix: string };
  registries: { text: string; prefix: string; suffix: string };
  loot_table: { text: string; prefix: string; suffix: string };
}

export type EntryType =
  | "tags"
  | "registries"
  | "custom_recipes"
  | "loot_tables"
  | "original_recipes"
  | "removed_recipes"
  | "mods";

export type AllowList ={registries: Registry[]}

type Registry = "block_entity_type"|
    "block"|
    "dimension"|
    "enchantment"|
    "entity_type"|
    "fluid"|
    "item"|
    "mob_effect"|
    "potion"|
    "recipe_type"|
    "villager_profession"|
    "worldgen/biome"|
    "worldgen/feature"|
    "worldgen/placed_feature"|
    "worldgen/structure";

export type Header = "#" | "##" | "###" | "####" | "#####" | "######";

export type Content = { content: string };

export interface Entry {
  removed: string[];
  added: string[];
  changed: string[];
}

export interface ContentEntry {
  entries: string[];
  content: Map<string, string | undefined>;
}

export class SimpleEntry implements Entry {
  removed: string[];
  added: string[];
  changed: string[];
  type: string;

  private constructor(
    type: string,
    removed: string[],
    added: string[],
    changed: string[],
  ) {
    this.type = type;
    this.added = added;
    this.changed = changed;
    this.removed = removed;
  }
}
