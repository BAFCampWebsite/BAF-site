# IDE

This document will help you get set up locally so that you can easily edit this website.

Of course, if you have your own way of doing things, fine by me.

## Installing Pre-requisites

If you don't have these, it's good to download them

- [Git](https://github.com/git-guides/install-git)
- [VSCode](https://code.visualstudio.com/download)
- [NodeJS + NPM](https://nodejs.org/en/download)
  - **Get the Installer** underneath the code block if that's scary and/or you don't know about package managers.

On windows, you can install all of the above by running the following command in powershell:

```powershell
winget install -e --id Git.Git;winget install -e --id OpenJS.NodeJS; winget install Microsoft.VisualStudioCode

powershellCopyEditSet-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Setting up VSCode

Install the recommended extensions from the extensions tab (astro, i18n-ally, and the markdownlint).

I have already defined most of the settings for you in the [vscode workspace settings file](.vscode/settings.json).

There's also a [VS Code launch config](.vscode/launch.json) for the dev server. You can start it from the **Run and Debug** panel (`Ctrl+Shift+D`) — it runs `npm run dev` and opens `http://localhost:4321` in your browser when ready.

## Working with i18n-ally

This tool makes it much easier to work with translation files in your IDE, as the placeholders get replaced for you in your code so you understand what goes where.

I suggest you briefly [look at the page here](https://github.com/lokalise/i18n-ally/wiki) to see what it can do, but colours and theme aside, you should see stuff like this:

![img](https://github.com/lokalise/i18n-ally/raw/screenshots/hover.png?raw=true)
