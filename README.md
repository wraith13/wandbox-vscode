# wandbox-vscode

[Wandbox](http://melpon.org/wandbox)([GitHub](https://github.com/melpon/wandbox/)) is a social compilation service. This extension is Wandbox front-end for Visual Studio Code.

> Wandbox is provided from [@melpon](https://github.com/melpon)( 🐕 dog) as a personal voluntary service.
> For keep this service, please do not put a high load on this service.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Main Commands

### Wandbox: Run
### Wandbox: Share

## Show Commands

### Wandbox: Show Compilers
### Wandbox: Show Compiler Info
### Wandbox: Show Raw JSON
### Wandbox: Show Web Site

## Setting Commands

Target of all setting commands is a current document.
Effect of all setting commands expires with next Visual Studio Code process.

### Wandbox: Set Server
### Wandbox: Set Compiler
### Wandbox: Set Additional Files
### Wandbox: Set StdIn
### Wandbox: Set Options
### Wandbox: Set Compiler Option Raw
### Wandbox: Set Runtime Option Raw
### Wandbox: Set Settings JSON
### Wandbox: Reset Settings



## Extension Settings

<!--

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

-->

This extension contributes the following settings:

* `wandbox.defaultSerer`: default wandbox server url
* `wandbox.languageCompilerMapping`: set compiler by language
* `wandbox.extensionCompilerMapping`: set compiler by file extension
* `wandbox.options`: set options by compiler
* `wandbox.compilerOptionRaw`: set raw option by compiler
* `wandbox.runtimeOptionRaw`: set raw runtime option by compiler

## Release Notes

### 1.0.0

Initial release of wandbox-vscode.

## Acknowledgments

Thanks [@melpon](https://github.com/melpon)( 🐕 dog) and [@kikairoya](https://github.com/kikairoya)( 🐂 bull) for awesome compilation service!

Thanks [@rhysd](https://github.com/rhysd)( 🐕 dog) for your support in TypeScript!

<!--

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on OSX or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on OSX or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (OSX) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

-->