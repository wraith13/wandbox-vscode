# wandbox-vscode ( [🇯🇵 Japanese](https://github.com/wraith13/wandbox-vscode/blob/master/README.ja.md) )
[![](http://vsmarketplacebadge.apphb.com/version/wraith13.wandbox-vscode.svg) ![](http://vsmarketplacebadge.apphb.com/installs/wraith13.wandbox-vscode.svg) ![](http://vsmarketplacebadge.apphb.com/rating/wraith13.wandbox-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=wraith13.wandbox-vscode)

[Wandbox](http://melpon.org/wandbox)([GitHub](https://github.com/melpon/wandbox/)) is a social compilation service. This extension is Wandbox front-end for Visual Studio Code.

> Wandbox is provided from [@melpon](https://github.com/melpon)( 🐕 dog) as a personal voluntary service.
> For keep this service, please do not put a high load on this service.

## Features

wandbox-vscode provide several commands in the Command Palette for compile, run, share.

> You can show Command Palette by keyboard-shortcuts.
>
> Mac: `[F1]` or `[Shift]+[Command]+[P]`
>
> Windows and Linux: `[F1] or [Shift]+[Ctrl]+[P]`

Available languages on wandbox at now :
Bash script, C, C#, C++, CoffeeScript, CPP, D, Elixir, Erlang, Groovy, Haskell, Java, JavaScript, Lazy K, Lisp, Lua, Pascal, Perl, PHP, Python, Rill, Ruby, Rust, Scala, SQL, Apple Swift, Vim script


## Tutorial
### 0. ⬇️ Install wandbox-vscode:
Launch VS Code Quick Open(Mac:`[Command]+[P]`, Windows and Linux: `[Ctrl]+[P]`), Type `ext install wandbox-vscode` and press [Enter] and click [Install].  Restart VS Code when installation is completed.
### 1. ✨️ Open new "Hello, World!":
Launch Command Palette(Mac:`[F1]` or `[Shift]+[Command]+[P]`, Windows and Linux: `[F1] or [Shift]+[Ctrl]+[P]`), Execute `Wandbox: Hello` command and select a "Hello, World!" file as you like.
> 👉 You can also open files in other ways.
### 2. 🚀 Compile & Run on wandbox:
Launch Command Palette again, Execute `Wandbox: Run` command.
### 3. 🔗 Make share URL:
Launch Command Palette again, Execute `Wandbox: Share` command.


## Screenshots

### command list
![](https://wraith13.github.io/wandbox-vscode/screenshots/command.list.png)

### languages
![](https://wraith13.github.io/wandbox-vscode/screenshots/languages.png)
![](https://wraith13.github.io/wandbox-vscode/screenshots/languages2.png)

### compilers
![](https://wraith13.github.io/wandbox-vscode/screenshots/compilers.png)

### options
![](https://wraith13.github.io/wandbox-vscode/screenshots/options.png)
![](https://wraith13.github.io/wandbox-vscode/screenshots/options2.png)

## Main Commands

* `Wandbox: Run` : run a current document on wandbox
* `Wandbox: Share` : make a share url

> You can disable to auto open share url by `wandbox.autoOpenShareUrl` setting.

* `Wandbox: Hello` : open new "Hello, World!"

## Show Commands

* `Wandbox: Show Raw JSON` : show a wandbox specs as raw JSON

> see [Wandbox API Reference](https://github.com/melpon/wandbox/blob/master/kennel2/API.rst)

* `Wandbox: Show Web Site` : open wandbox web site
* `Wandbox: Show Settings` : show all wandbox-vscode settings
* `Wandbox: Show History` : show share history

## Clear Commands

* `Wandbox: Clear History` : clear share history

## Setting Commands

Target of all setting commands is a current document.
Effect of all setting commands expires with next Visual Studio Code process.

* `Wandbox: Set Server` : set a wandbox server url

> You can use [`https://wandbox.fetus.jp/`](https://wandbox.fetus.jp/) . This Wandbox server has a wide variety of PHP compilers.
> This Wandbox server is provided from [@fetus-hina](https://github.com/fetus-hina) as a personal voluntary service.
> For keep this service, please do not put a high load on this service.

* `Wandbox: Set Compiler` : set a compiler 
* `Wandbox: Set Options` : set options for compile
* `Wandbox: Set Settings JSON` : set all temporary settings by JSON
* `Wandbox: Reset Settings` : reset all temporary settings


## Extension Settings

This extension contributes the following settings:

* `wandbox.Servers`: wandbox server url list ( first one is default wandbox server url )
* `wandbox.simplifyPostData`: simplify post data when showing
* `wandbox.autoOpenShareUrl`: when make a share url, auto open it
* `wandbox.outputChannelName`: output channel name
* `wandbox.languageMapping`: set language in wandbox by language in vscode
* `wandbox.languageCompilerMapping`: set compiler by language
* `wandbox.extensionLanguageMapping`: set language by file extension
* `wandbox.extensionCompilerMapping`: set compiler by file extension
* `wandbox.options`: set options by compiler
* `wandbox.compilerOptionRaw`: set raw option by compiler
* `wandbox.runtimeOptionRaw`: set raw runtime option by compiler
* `wandbox.helloWolrdFiles`: set hello world files
* `wandbox.maxHistorySize`: set max share history size
* `wandbox.emoji`: set emoji

> You can set following if your environment's font is poor.
>```json
>    "wandbox.emoji": {
>        "stamp": null,
>        "error": null,
>        "warning": null,
>        "hint": null,
>        "signal": null,
>        "link": null,
>        "lap": null,
>        "new": null,
>        "checkedBox": "[o]",
>        "uncheckedBox": "[_]",
>        "checkedRadio": "(o)",
>        "uncheckedRadio": "(_)",
>        "edit": null,
>        "menuSeparator": "---------------------------------------------"
>    }
>```
>
> `wandbox.emoji` setting's screenshot in Mac ( for reference )
>
> ![](https://wraith13.github.io/wandbox-vscode/screenshots/emoji.png?!)

## Release Notes

see ChangLog on [marketplace](https://marketplace.visualstudio.com/items/wraith13.wandbox-vscode/changelog) or [github](https://github.com/wraith13/wandbox-vscode/blob/master/CHANGELOG.md)


## "Wandbox has not my favorite compiler!"

No probrem! You can pull request to [wandbox](https://github.com/melpon/wandbox/)!

## Support

[GitHub Issues](https://github.com/wraith13/wandbox-vscode/issues)

## License

[Boost Software License](https://github.com/wraith13/wandbox-vscode/blob/master/LICENSE_1_0.txt)

## Acknowledgments

Thanks [@melpon](https://github.com/melpon)( 🐕 dog) and [@kikairoya](https://github.com/kikairoya)( 🐂 bull) for awesome compilation service!

Thanks [@fetus-hina](https://github.com/fetus-hina)( 👶 baby) for a PHP specialized wandbox service!

Thanks [@rhysd](https://github.com/rhysd)( 🐕 dog) for your support in TypeScript!

Thanks [@chomado](https://github.com/chomado)( 👧 girl) for a great extension icon!
