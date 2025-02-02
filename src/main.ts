import { Modpack } from "./core/modpack.ts";
import { parseArgs } from "https://deno.land/std@0.218.2/cli/parse_args.ts";
import { Config } from "./core/config.ts"
import { CompareModpacks } from "./core/compare_modpacks.ts";
import { GenerateMarkdown } from "./core/generate_markdown.ts";
import { LoggerManager } from "../src/core/logger.ts"
import type * as log from "https://deno.land/std@0.218.2/log/mod.ts";

export class AllTheLogs {
  public static LOGGER: log.Logger;
  private args;
  private path;
  constructor(DenoArgs: string[]){
    this.args = parseArgs(DenoArgs, {string: ["old","new","path","commits"]})
    this.path = this.args.config ?? Deno.cwd() + "/allthelogs.toml"
    AllTheLogs.LOGGER = LoggerManager.createInstance(this.args.debug ? "debug" : "default")
  }

  public async init(){
    if (this.args._[0] == "init"){
      if (typeof this.args._[1] == "string"){
        AllTheLogs.LOGGER.info(`Creating config file at: ${this.args._[1] + "/allthelogs.toml"}`)
        Config.create(this.args._[1] + "/allthelogs.toml")
      } else {
        AllTheLogs.LOGGER.info(`Creating config file at: ${Deno.cwd() + "/allthelogs.toml"}`)
        Config.create(Deno.cwd() + "/allthelogs.toml")
      }
    }

    if (this.args.old && this.args.new){
      AllTheLogs.LOGGER.debug(`Reading config file at: ${this.path}`)
      let config = Config.create(this.path as string)
      config.args = this.args
      this.args.path && (config.data.default_folder = this.args.path)
      AllTheLogs.LOGGER.debug(`Default folder is: ${config.data.default_folder}`)
      AllTheLogs.LOGGER.debug(`Reading old modpack at folder: ${config.data.default_folder}/${this.args.old}`)
      let oldModpack = new Modpack(`${config.data.default_folder}/${this.args.old}`)
      AllTheLogs.LOGGER.debug(`Reading new modpack at folder: ${config.data.default_folder}/${this.args.new}`)
      let newModpack = new Modpack(`${config.data.default_folder}/${this.args.new}`)
      let comparison = new CompareModpacks(oldModpack, newModpack, config)
      let markdown = new GenerateMarkdown(comparison)
      await markdown.generateMarkDown()
      Deno.exit(0)
    }

    if (this.args.help) {
      this.printHelp()
    }
    this.printHelp()
  }

  private printHelp(){
    console.log(`Usage: allthelogs <command> [<folder>]`);
    console.log(`  or:  allthelogs --old <folder-name> --new <folder-name> [OPTIONS]...`);
    console.log("\nCommands:");
    console.log("  init [<folder>]            Generates config files");  
    console.log("\nRequired flags:");
    console.log("  --old <folder-name>        Set the old modpack that contains 'export' folder to compare");
    console.log("                               *DO NOT* provide full path");
    console.log("                               This will concatenate with default_folder or --path");  
    console.log("  --new <folder-name>        Set the new modpack that contains 'export' folder to compare");  
    console.log("                               *DO NOT* provide full path, use '--path <folder>' to complement");  
    console.log("\nOptional flags:");
    console.log("  --commits \"base...head\"  Set the basehead of commits to request");
    console.log("  --config <file>            Set config file");
    console.log("  --path <folder-path>       Overwrites default_folder from config file");
    console.log("  --output <file>            Overwrites default output file location");
    console.log("  --debug                    Enable debug messages");
    Deno.exit(0)
  }
}

await new AllTheLogs(Deno.args).init()
