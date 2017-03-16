# wandbox-vscode ( [🇬🇧 English](https://github.com/wraith13/wandbox-vscode/blob/master/README.md) )

[![Visual Studio Marketplace](http://vsmarketplacebadge.apphb.com/version/wraith13.wandbox-vscode.svg)
![installs](http://vsmarketplacebadge.apphb.com/installs/wraith13.wandbox-vscode.svg)
![rating](http://vsmarketplacebadge.apphb.com/rating/wraith13.wandbox-vscode.svg)](https://marketplace.visualstudio.com/items?itemName=wraith13.wandbox-vscode)

[Wandbox](http://melpon.org/wandbox)([GitHub](https://github.com/melpon/wandbox/)) はソーシャルコンパレーションサービスです。このエクステンションは Visual Studio Code の為の Wandbox フロントエンドです。

> Wandbox は [@melpon](https://github.com/melpon)( 🐕 犬) が個人的に無償(自腹)で提供しているサービスです。
> このサービスが提供され続ける為、このサービスに高負荷をかけないようにしてください。
> [あなたはスポンサーになることもできます。](https://gist.github.com/melpon/8f5d7a8e991ed466d09cf887bd8d92ce)

## 機能

wandbox-vscode はコンパイル、実行、シェアを行う為のいくつかのコマンドをコマンドパレット上で提供します。

> コマンドパレットはキーボードショートカットで表示できます。
>
> Mac: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd>
>
> Windows and Linux: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>P</kbd>

現在 wandbox で利用可能な言語 :
Bash script, C, C#, C++, CoffeeScript, CPP, D, Elixir, Erlang, Go, Groovy, Haskell, Java, JavaScript, Lazy K, Lisp, Lua, OCaml, Pascal, Perl, PHP, Python, Rill, Ruby, Rust, Scala, SQL, Apple Swift, Vim script


## チュートリアル

### 0. ⬇️ wandbox-vscodeのインストール:

VS Code のクイックオープンを出して(Mac:<kbd>Command</kbd>+<kbd>P</kbd>, Windows and Linux: <kbd>Ctrl</kbd>+<kbd>P</kbd>)、 `ext install wandbox-vscode` とタイプし <kbd>Enter</kbd> キーを押下し、<kbd>Install</kbd> をクリックします。インストールが終わったら VS Code を再起動してください。

### 1. ✨️ 新規"Hello, World!"を開く:

コマンドパレットを出して(Mac:<kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Command</kbd>+<kbd>P</kbd>, Windows and Linux: <kbd>F1</kbd> or <kbd>Shift</kbd>+<kbd>Ctrl</kbd>+<kbd>P</kbd>)、 `Wandbox: Hello` コマンドを実行し、適当な "Hello, World!" ファイルを選択します。

> 👉 その他の方法で開いたファイルでも構いません。

### 2. 🚀 wandbox上でのコンパイルと実行:

またコマンドパレットを出して、 `Wandbox: Run` コマンドを実行します。

### 3. 🔗 シェアURLの作成:

コマンドパレットから `Wandbox: Share` コマンドを実行します。

> 👉 自動的にシェアURLを開く挙動は `wandbox.autoOpenShareUrl` の設定で無効化できます。

### 4. 📅 シェアURLの履歴表示:

コマンドパレットから `Wandbox: History` コマンドを実行します。

> 👉 `wandbox.maxHistorySize` の設定で保存する履歴の数を指定できます。

### 5. 🔧 次のステップ:

`Wandbox: Set Compiler` コマンドでコンパイラを変更できますし、 `Wandbox: Set Options` コマンドで様々なコンパイルオプションを指定できまのでいろいろ試してみてください。

> 👉 オプションの内容は選択されているコンパイラによって大幅に変わります。

また settings.json で wandbox-vscode の[各種設定](#エクステンションの設定)を変更したり、 keybindings.json で wandbox-vscode のコマンドに[キーボードショートカット](#キーボードショートカットの設定)を割り当てる事もできます。

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

> 👉 自動的にシェアURLを開く挙動は `wandbox.autoOpenShareUrl` の設定で無効化できます。

* `Wandbox: Hello` : 新規 "Hello, World!" を開きます

## 表示コマンド

* `Wandbox: Show Raw JSON` : wandbox の仕様情報を生の JSON で表示します

> 👉 参照： [Wandbox API Reference](https://github.com/melpon/wandbox/blob/master/kennel2/API.rst)

* `Wandbox: Show Web Site` : wandbox web サイトを開きます
* `Wandbox: Show Settings` : wandbox-vscode の全ての設定表示します。
* `Wandbox: Show History` : シェア履歴を表示します。

> 👉 `wandbox.maxHistorySize` の設定で保存する履歴の数を指定できます。

## 消去コマンド

* `Wandbox: Clear History` : シェア履歴を消去します。

## 設定コマンド

全ての設定コマンドはカレントのドキュメントに対して行われます。
全ての設定コマンドの効果は Visual Studio Code を次回起動した時には消えています。

* `Wandbox: Set Server` : wandboxサーバーURLを設定します。

> 👉 [`https://wandbox.fetus.jp/`](https://wandbox.fetus.jp/) を使うこともできます。この Wandbox サーバーには非常に多くの PHP コンパイラがあります。
> Wandbox は [@fetus-hina](https://github.com/fetus-hina) が個人的に無償(自腹)で提供しているサービスです。
> このサービスが提供され続ける為、このサービスに高負荷をかけないようにしてください。

* `Wandbox: Set Compiler` : コンパイラを設定します。
* `Wandbox: Set Options` : コンパイルオプションを設定します。
* `Wandbox: Set Settings JSON` : JSON で一時的な設定をします。
* `Wandbox: Reset Settings` : 全ての一時的な設定をリセットします。


## エクステンションの設定

[`settings.json`](https://code.visualstudio.com/docs/customization/userandworkspace#_creating-user-and-workspace-settings)( Mac: <kbd>Command</kbd>+<kbd>,</kbd>, Windows / Linux: <kbd>ファイル</kbd> → <kbd>基本設定</kbd> → <kbd>設定</kbd> ) で次の設定ができます。

* `wandbox.Servers`: wandboxサーバーURLリスト ( 最初のURLがデフォルト wandboxサーバーURLになります。 )
* `wandbox.simplifyPostData`: postデータを表示の際に簡素化します
* `wandbox.autoOpenShareUrl`: シェアURL作成時に自動的にそのURLを開きます
* `wandbox.outputChannelName`: 出力チャンネル名
* `wandbox.languageMapping`: vscodeでの言語に対しwandboxでの言語を設定します
* `wandbox.languageCompilerMapping`: 言語に対してコンパイラを設定します
* `wandbox.extensionLanguageMapping`: ファイル拡張子に対して言語を設定します
* `wandbox.extensionCompilerMapping`: ファイル拡張子に対してコンパイラを設定します
* `wandbox.options`: コンパイラに対してオプションを設定します
* `wandbox.compilerOptionRaw`: コンパイラに対して生のオプションを設定します
* `wandbox.runtimeOptionRaw`: コンパイラに対して生の実行時オプションを設定します
* `wandbox.helloWolrdFiles`: hello world ファイルを設定
* `wandbox.maxHistorySize`: 最大履歴サイズを設定
* `wandbox.emoji`: 絵文字を設定

> 👉 あなたの環境のフォントが貧相な場合は次のような設定にしてください。
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
> Mac での `wandbox.emoji` 設定のスクリーンショット ( 参考用 )
>
> ![](https://wraith13.github.io/wandbox-vscode/screenshots/emoji.png?!)

## キーボードショートカットの設定

wandbox-vscode のコマンドには初期状態ではキーボードショートカットが割り当てられていませんが、
[`keybindings.json`](https://code.visualstudio.com/docs/customization/keybindings#_customizing-shortcuts)( Mac: <kbd>Code</kbd> → <kbd>基本設定</kbd> → <kbd>キーボード ショートカット</kbd>, Windows / Linux: <kbd>ファイル</kbd> → <kbd>基本設定</kbd> → <kbd>キーボード ショートカット</kbd>) でキーボードショートカットを割り当てる事ができます。

`keybindings.json` で指定するコマンド名はコマンドパレット上で入力する名前は異なりますので、下の対応表を見て設定してください。

|コマンドパレット上|keybindings.json上|
|-|-|
|`Wandbox: Run`|`wandbox.run`|
|`Wandbox: Share`|`wandbox.share`|
|`Wandbox: Hello`|`wandbox.hello`|
|`Wandbox: Show Raw JSON`|`wandbox.showListJson`|
|`Wandbox: Show Web Site`|`wandbox.showWeb`|
|`Wandbox: Show Settings`|`wandbox.showSettings`|
|`Wandbox: Show History`|`wandbox.showHistory`|
|`Wandbox: Clear History`|`wandbox.clearHistory`|
|`Wandbox: Set Server`|`wandbox.setFileServer`|
|`Wandbox: Set Compiler`|`wandbox.setFileCompiler`|
|`Wandbox: Set Options`|`wandbox.setFileOptions`|
|`Wandbox: Set Settings JSON`|`wandbox.setFileSettingJson`|
|`Wandbox: Reset Settings`|`wandbox.resetFileSettings`|

> ⚠️ `extention.*` のようなコマンド名は非推奨となりました。

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

## リンク

[Wandbox関連プロジェクト](https://github.com/search?p=1&q=wandbox&type=Repositories&utf8=✓)
