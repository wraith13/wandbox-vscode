# Change Log

All notable changes to the "wandbox-vscode" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 2.2.1 - 2017-07-16

### Fixed

- Fixed issue that `Wandbox: New` command dose not work without current text document.

## 2.2.0 - 2017-04-07

### Added

- Added `Wandbox: New` command.

### Deprecated

- `Wandbox: Hello` command.

### Fixed

- Fixed perl comment symbol in Hello, world!

## 2.1.7 - 2017-03-25

### Added

- Supported Nim

## 2.1.6 - 2017-03-24

### Added

- Supported Crystal

## 2.1.5 - 2017-03-23

### Added

- Supported Pony
- DOC: Added a wandbox-builder link in README

### Changed

- Changed wandbox server address to a [new server](https://wandbox.org/). ( old url is http://melpon.org/wandbox/ )

## 2.1.4 - 2017-03-20

### Fixed

- DOC: Fixed a Date in Change Log

## 2.1.3 - 2017-03-20

### Fixed

- Fixed issue that it doesn't set language mode to hello world document with `Wandbox: Hello` command.
- Fixed issue that it volatiles settings.

## 2.1.2 - 2017-03-17

### Added

- Supported OCaml
- Supported Go lang
- DOC: Contributed to Tutorial secttion in README
- DOC: Contributed to Extension Settings secttion in README
- DOC: Keyboard shortcut Settings secttion in README

### Fixed

- Changed all internal command name( example: `extension.invokeWandbox` → `wandbox.run` )

### Deprecated

- All internal command name like as `extension.*`

## 2.1.1 - 2017-03-04

### Added

- DOC: README in Japanese
- DOC: Tutorial secttion in README

### Fixed

- Fixed issue that it doesn't write "Canceled" to log when to cancel `Wandbox: Set Options` command.


## 2.1.0 - 2017-03-03

### Added

- Added `Wandbox: Show History` command.
- Added `Wandbox: Clear History` command.
- Added `wandbox.maxHistorySize` setting.


## 2.0.1 - 2017-02-28

### Fixed

- Fixed issue that additionals doesn't work.
- Fixed issue that error handling in additionals and stdin doesn't work.


## 2.0.0 - 2017-02-27

### Added

- Added `wandbox.Servers` setting.
- Added `wandbox.emoji` setting.
- Added `wandbox.languageMapping` setting.
- Added `wandbox.extensionLanguageMapping` setting.
- DOC: VSMarketplaceBadge.
- DOC: Screenshots.

### Changed

- Changed to quick pick based UI for to easy use.
- Default compiler selection was changed to follows wandbox server .
- Writes "Canceled" in log when a command is canceled by user operation.
- Changed `wandbox.languageCompilerMapping` default setting to null.
- Changed `wandbox.extensionCompilerMapping` default setting to null.
- Changed PHP's hello, world! file ( https://github.com/wraith13/wandbox-vscode/pull/3 )

### Fixed

- Fixed issue that reset settings without intention when to open untitled documents.

### Removed

- Removed `wandbox.defaultServer` setting. ( You can use `wandbox.Servers` setting. )
- Removed `Wandbox: Show Compilers` command. ( You can use `Wandbox: Set Compilers` command or `Wandbox: Show Raw JSON` command. )
- Removed `Wandbox: Show Options` command. ( You can use `Wandbox: Set Options` command or `Wandbox: Show Raw JSON` command. )
- Removed `Wandbox: Set Additional Files` command. ( You can use `Wandbox: Set Options` command. )
- Removed `Wandbox: Set StdIn` command. ( You can use `Wandbox: Set Options` command. )
- Removed `Wandbox: Set Compiler Option Raw` command. ( You can use `Wandbox: Set Options` command. )
- Removed `Wandbox: Set Runtime Option Raw` command. ( You can use `Wandbox: Set Options` command. )


## 1.1.0 - 2017-02-07

### Added

- Added `Wandbox: Hello Command` ( with `wandbox.helloWolrdFiles` setting ).
- Added `wandbox.simplifyPostData` setting.

### Changed

- Update a compiler mapping table for current Wandbox.
- Included a post file in the POST data on log.

### Fixed

- Fixed issue that zombie settings on untitled documents.
- Fixed issue that showing old json cache.
- Fixed issue that not showing license in marketplace.
- DOC: Swift → Apple Swift (in description)

### Removed

- Removed unnecessary files from package.

## 1.0.5 - 2017-02-07

### Added

- `wandbox.outputChannelName` setting

### Changed

- optimize output when wandbox server return error.

### Fixed

- DOC:(typo) wandbox → Wandbox (in description)
- DOC:(typo) wandbox.defaultSerer → wandbox.defaultServer (in README)

## 1.0.4 - 2017-02-05

### Changed

- Show Compilers command: grouping Compilers by language.
- DOC: Added available languages to description for search in marketplace.
- DOC: Added link to Wandbox API Reference in Show Commands section at README.

## 1.0.3 - 2017-02-04

### Fixed

- Fixed crash some command when show a extension detail.
- Reset Settings command: Remove the trash at the end of the title.

### Changed

- DOC: Added available languages in Features section at README.

## 1.0.2 - 2017-02-04

### Changed

- default C compiler clang-3.3-c → clang-head-c
- DOC: description for search in marketplace.

## 1.0.1 - 2017-02-03

### Fixed

- DOC: http://wandbox.fetus.jp/ → https://wandbox.fetus.jp/

## 1.0.0 - 2017-02-03

### Added

- Initial release of wandbox-vscode.

## [Unreleased]

## 0.0.0 - 2017-01-21

### Added

- Start this project.