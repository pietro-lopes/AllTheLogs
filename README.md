
# 📝AllTheLogs

## ✔️Requirements
- Modpack for Minecraft 1.20.1 or 1.21.1
- [Deno](https://docs.deno.com/runtime/getting_started/installation/) (the best Javascript runtime)
- [KubeJS](https://www.curseforge.com/minecraft/mc-mods/kubejs) installed on your modpack
## 💾How to install

- Clone this repository, enter it
- Make sure Deno is installed
- At root of this repository, run this command
`deno install -g --allow-read --allow-write --allow-net=api.github.com --allow-env --allow-sys -n allthelogs .\src\main.ts`

## 🔨How to use
### 🆕 First time setup
- Choose a folder to be your working directory of your modpack, for example:
 `C:\Users\MyUser\Documents\MyModpackChangelogs\ATM10`
- Run this command inside this folder to create the config file
`allthelogs init`
- Open `allthelogs.toml` and edit `modpack_name` to your needs
- Create a folder `modpack_data`
### 👨‍🔧 Preparing your exports
- Create the folders inside `modpack_data` with the name of the versions you will compare, for example: create a folder `2.30` and `2.31`
- Launch your modpack on your old version that you want compare
 (Note: if your modpack is heavy, give as much as RAM you can, it will need)
 - Open a world and when you are in, run this command
 for 1.20.1: `/kubejs export`
 for 1.21.1: `/kubejs export debug`
- Repeat steps above for the newer version of the pack that you want to compare
- Now go to your older version of the modpack instance and go to `local/kubejs` you will see a folder `export`, move it to (for this example) `2.30` inside `modpack_data`
- Repeat the steps above but now for the newer instance and move to folder `2.31`

### 🖨️ Generating the logs
- You should now have a folder with this structure (using our example)
```
ATM10
 |- allthelogs.toml
 |- modpack_data/
    |- 2.30/
       |- export/
    |- 2.31
       |- export/
```
- Go to the root of the modpack folder (where the allthelogs.toml is) and run this command
 `allthelogs --old "2.30" --new "2.31"`
 - Wait for it to generate the markdown, may take a few minutes on big packs.
 - Now your file is generated and you are free to edit and add more info!

### :octocat: Github Compatibility
- If your project is *public* on Github and you want to grab the commits from a range of tags/commit hashs, you need to configure it on `allthelogs.toml`
- Setup the `owner` and `repo` fields
- After that you can use on your commands `--commits "2.30...2.31"` if you tag your commits or use the hash directly `--commits "8bf12e2...07c9254"`

## 🎲 Showcase
- [ATM10](https://github.com/AllTheMods/ATM-10/blob/main/CHANGELOG.md) (*not this index*)

# 📬 Contact

You can reach me on [All The Mods Discord](https://discord.gg/allthemods) with `@Uncandango`, you can also open your issue here.

# ⚖️ License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.