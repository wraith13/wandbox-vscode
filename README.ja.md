# wandbox-vscode ( [🇬🇧 English](https://github.com/wraith13/wandbox-vscode/blob/master/README.md) )
[![](http://vsmarketplacebadge.apphb.com/version/wraith13.wandbox-vscode.svg) ![](http://vsmarketplacebadge.apphb.com/installs/wraith13.wandbox-vscode.svg) ![](http://vsmarketplacebadge.apphb.com/rating/wraith13.wandbox-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=wraith13.wandbox-vscode)

[Wandbox](http://melpon.org/wandbox)([GitHub](https://github.com/melpon/wandbox/)) はソーシャルコンパレーションサービスです。このエクステンションは Visual Studio Code の為の Wandbox フロントエンドです。

> Wandbox は [@melpon](https://github.com/melpon)( 🐕 犬) が個人的に無償(自腹)で提供しているサービスです。
> このサービスが提供され続ける為、このサービスに高負荷をかけないようにしてください。

## 機能

wandbox-vscode はコンパイル、実行、シェアを行う為のいくつかのコマンドをコマンドパレット上で提供します。

> コマンドパレットはキーボードショートカットで表示できます。
>
> Mac: `[F1]` or `[Shift]+[Command]+[P]`
>
> Windows and Linux: `[F1] or [Shift]+[Ctrl]+[P]`

現在 wandbox で利用可能な言語 :
Bash script, C, C#, C++, CoffeeScript, CPP, D, Elixir, Erlang, Groovy, Haskell, Java, JavaScript, Lazy K, Lisp, Lua, Pascal, Perl, PHP, Python, Rill, Ruby, Rust, Scala, SQL, Apple Swift, Vim script

## スクリーンショット

### コマンドリスト
![](https://wraith13.github.io/wandbox-vscode/screenshots/command.list.png)

### 言語
![](https://wraith13.github.io/wandbox-vscode/screenshots/languages.png)
![](https://wraith13.github.io/wandbox-vscode/screenshots/languages2.png)

### コンパイラ
![](https://wraith13.github.io/wandbox-vscode/screenshots/compilers.png)

### オプション
![](https://wraith13.github.io/wandbox-vscode/screenshots/options.png)
![](https://wraith13.github.io/wandbox-vscode/screenshots/options2.png)

## メインコマンド

* `Wandbox: Run` : カレントのドキュメントを wandbox で実行します
* `Wandbox: Share` : シェアURLを作成します

> 自動的にシェアURLを開く挙動は `wandbox.autoOpenShareUrl` の設定で無効化できます。

* `Wandbox: Hello` : open new "Hello, World!" ( if without file extension, show available list of "Hello, World!" )

## 表示コマンド

* `Wandbox: Show Raw JSON` : show a wandbox specs as raw JSON

> see [Wandbox API Reference](https://github.com/melpon/wandbox/blob/master/kennel2/API.rst)

* `Wandbox: Show Web Site` : open wandbox web site
* `Wandbox: Show Settings` : show all wandbox-vscode settings
* `Wandbox: Show History` : show share history

## 消去コマンド

* `Wandbox: Clear History` : clear share history

## 設定コマンド

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


## エクステンションの設定

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
* `wandbox.emoji`: set emoji
* `wandbox.maxHistorySize`: set max share history size

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

## リリースノート

[marketplace](https://marketplace.visualstudio.com/items/wraith13.wandbox-vscode/changelog) あるいは [github](https://github.com/wraith13/wandbox-vscode/blob/master/CHANGELOG.md) の ChangLog を参照してください。


## "Wandbox に俺の好きなコンパイラがないぞ！"

問題ありません！　あなたは [wandbox](https://github.com/melpon/wandbox/) にプルリクエストを投げることができます！

## サポート

[GitHub Issues](https://github.com/wraith13/wandbox-vscode/issues)

## ライセンス

[Boost Software License](https://github.com/wraith13/wandbox-vscode/blob/master/LICENSE_1_0.txt)

## 謝辞

Thanks [@melpon](https://github.com/melpon)( 🐕 犬) and [@kikairoya](https://github.com/kikairoya)( 🐂 牛) for awesome compilation service!

Thanks [@fetus-hina](https://github.com/fetus-hina)( 👶 baby) for a PHP specialized wandbox service!

Thanks [@rhysd](https://github.com/rhysd)( 🐕 犬) for your support in TypeScript!

Thanks [@chomado](https://github.com/chomado)( 👧 girl) for a great extension icon!
