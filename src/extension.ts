'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    var languageMapping =
    [
        //  Windows Bat
        { vscode:'bat', wandbox:null },
        //  Clojure
        { vscode:'clojure', wandbox:null },
        //  Coffeescript
        { vscode:'coffeescript', wandbox:'coffee-script-head' },
        //  C
        { vscode:'c', wandbox:'clang-3.3-c' },
        //  C++
        { vscode:'cpp', wandbox:'clang-head' },
        //  C#
        { vscode:'csharp', wandbox:'mcs-head' },
        //  CSS
        { vscode:'css', wandbox:null },
        //  Diff
        { vscode:'diff', wandbox:null },
        //  Dockerfile
        { vscode:'dockerfile', wandbox:null },
        //  F#
        { vscode:'fsharp', wandbox:null },
        //  Git
        { vscode:'git-commit', wandbox:null },
        { vscode:'git-rebase', wandbox:null },
        //  Go
        { vscode:'go', wandbox:null },
        //  Groovy
        { vscode:'groovy', wandbox:'groovy-2.2.1' },
        //  Handlebars
        { vscode:'handlebars', wandbox:null },
        //  HTML
        { vscode:'html', wandbox:null },
        //  Ini
        { vscode:'ini', wandbox:null },
        //  Java
        { vscode:'java', wandbox:'java8-openjdk' },
        //  JavaScript
        { vscode:'javascript', wandbox:'node-head' },
        //  JSON
        { vscode:'json', wandbox:null },
        //  Less
        { vscode:'less', wandbox:null },
        //  Lua
        { vscode:'lua', wandbox:'lua-5.3.0' },
        //  Makefile
        { vscode:'makefile', wandbox:null },
        //  Markdown
        { vscode:'markdown', wandbox:null },
        //  Objective-C
        { vscode:'objective-c', wandbox:null },
        //  Perl
        { vscode:'perl', wandbox:'perl-head' },
        { vscode:'perl6', wandbox:null },
        //  PHP
        { vscode:'php', wandbox:'php-head' },
        //  Powershell
        { vscode:'powershell', wandbox:null },
        //  Pug
        { vscode:'jade', wandbox:null },
        //  Python
        { vscode:'python', wandbox:'python-head	' },
        //  R
        { vscode:'r', wandbox:null },
        //  Razor (cshtml)
        { vscode:'razor', wandbox:null },
        //  Ruby
        { vscode:'ruby', wandbox:'ruby-head' },
        //  Rust
        { vscode:'rust', wandbox:'rust-head' },
        //  Sass
        { vscode:'scss', wandbox:null }, // (syntax using curly brackets)
        { vscode:'sass', wandbox:null }, // (indented syntax)
        //  ShaderLab
        { vscode:'shaderlab', wandbox:null },
        //  Shell Script (Bash)
        { vscode:'shellscript', wandbox:'bash' },
        //  SQL
        { vscode:'sql', wandbox:'sqlite-head' },
        //  Swift
        { vscode:'swift', wandbox:'swift-2.2' },
        //  TypeScript
        { vscode:'typescript', wandbox:null },
        //  Visual Basic
        { vscode:'vb', wandbox:null },
        //  XML
        { vscode:'xml', wandbox:null },
        //  XSL
        { vscode:'xsl', wandbox:null },
        //  YAML
        { vscode:'yaml', wandbox:null },
    ];
    var extensionMapping =
    [
        { extension:'cpp', wandbox:'clang-head' },
        { extension:'cxx', wandbox:'clang-head' },
        { extension:'c', wandbox:'clang-3.3-c' },
        { extension:'d', wandbox:'dmd-head' },
        { extension:'rill', wandbox:'rill-head' },
        { extension:'hs', wandbox:'ghc-head' },
        { extension:'pl', wandbox:'perl-head' },
        { extension:'py', wandbox:'python-head' },
        { extension:'rb', wandbox:'ruby-head' },
        { extension:'php', wandbox:'php-head' },
        { extension:'erl', wandbox:'erlang-head' },
        { extension:'ex', wandbox:'elixir-head' },
        { extension:'exs', wandbox:'elixir-head' },
        { extension:'js', wandbox:'node-head' },
        { extension:'coffee', wandbox:'coffee-script-head' },
        { extension:'sql', wandbox:'sqlite-head' },
        { extension:'scala', wandbox:'scala-2.12.x' },
        { extension:'lua', wandbox:'lua-5.3.0' },
        { extension:'rs', wandbox:'rust-head' },
        { extension:'vim', wandbox:'vim-7.4.1714' },
        { extension:'swift', wandbox:'swift-2.2' },
        { extension:'sh', wandbox:'bash' },
        { extension:'lazy', wandbox:'lazyk' },
        { extension:'lisp', wandbox:'clisp-2.49.0' },
        { extension:'pas', wandbox:'fpc-2.6.2' },
        { extension:'java', wandbox:'java8-openjdk' },
        { extension:'groovy', wandbox:'groovy-2.2.1' },
        { extension:'gvy', wandbox:'groovy-2.2.1' },
    ];
    var getWandboxCompilerName = (vscodeLang :string, fileName :string, callback : (string) => void) =>
    {
        var hit : string;
        vscodeLang && languageMapping.forEach
        (
            item =>
            {
                if (item.vscode == vscodeLang)
                {
                    hit = item.wandbox;
                }
            }
        );
        if (!hit && fileName)
        {
            var elements = fileName.split('.');
            if (2 <= elements.length)
            {
                var extension = elements[elements.length -1];
                extensionMapping.forEach
                (
                    item =>
                    {
                        if (item.extension == extension)
                        {
                            hit = item.wandbox;
                        }
                    }
                );
            }
        }
        if (hit)
        {
            callback(hit);
        }
        else
        {
            vscode.window.showInputBox()
            .then(name => callback(name));
        }
    };
    var outputChannel :vscode.OutputChannel;
    var makeSureOutputChannel = () =>
    {
        if (!outputChannel)
        {
            outputChannel = vscode.window.createOutputChannel('Wandbox');
        }
        else
        {
            outputChannel.appendLine('');
        }
        return outputChannel;
    };
    var bowWow = () =>
    {
        outputChannel.show();
        outputChannel.appendLine('Bow-wow! ' + new Date().toString());
    };
    var getList = (callback : (string) => void) =>
    {
        outputChannel.appendLine('HTTP GET http://melpon.org/wandbox/api/list.json?from=wandbox-vscode');
        request.get
        (
            'http://melpon.org/wandbox/api/list.json?from=wandbox-vscode',
            function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    callback(body);
                }
                else
                if (response.statusCode)
                {
                    outputChannel.appendLine('statusCode: ' +response.statusCode);
                }
                else
                {
                    outputChannel.appendLine('error: ' +error);
                }
            }
        );
    };
    var list : any[];
    var makeSureList = (callback : (list :any[]) => void) =>
    {
        if (!list)
        {
            getList(body => callback(list = JSON.parse(body)));
        }
        else
        {
            callback(list);
        }
    };

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wandbox-vscode" is now active!');

    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.openWandboxWeb',
            () =>
            {
                vscode.commands.executeCommand
                (
                    'vscode.open',
                    vscode.Uri.parse('http://melpon.org/wandbox/?from=wandbox-vscode')
                );
            }
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.getWandboxList',
            () =>
            {
                makeSureOutputChannel();
                bowWow();

                makeSureList
                (
                    list => list && list.forEach
                    (
                        item => outputChannel.appendLine(item.name +'\t' +item.language)
                    )
                );
            }
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.showWandboxItem',
            () =>
            {
                makeSureOutputChannel();
                bowWow();

                vscode.window.showInputBox()
                .then
                (
                    name =>
                    makeSureList
                    (
                        list =>
                        {
                            var hit :any;
                            list && list.forEach
                            (
                                item =>
                                {
                                    if (name == item.name)
                                    {
                                        hit = item;
                                    }
                                }
                            );
                            hit && outputChannel.appendLine(JSON.stringify(hit, null, 4));
                        }
                    )
                )
            }
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.showWandboxListJson',
            () =>
            {
                makeSureOutputChannel();
                bowWow();

                getList
                (
                    body =>
                    {
                        list = JSON.parse(body);
                        var provider = vscode.workspace.registerTextDocumentContentProvider
                        (
                            'wandbox-list-json',
                            new class implements vscode.TextDocumentContentProvider
                            {
                                provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken)
                                    : string | Thenable<string>
                                {
                                    return JSON.stringify(list, null, 4);
                                }
                            }
                        );
                        vscode.workspace.openTextDocument
                        (
                            vscode.Uri.parse('wandbox-list-json://melpon.org/wandbox-api-list.json')
                        )
                        .then
                        (
                            (value: vscode.TextDocument) =>
                            {
                                vscode.window.showTextDocument(value);
                                provider.dispose();
                            }
                        );
                    }
                );
            }
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.invokeWandbox',
            (args :any[]) =>
            {
                makeSureOutputChannel();
                bowWow();

                args && args.forEach
                (
                    arg => outputChannel.appendLine('arg: ' +arg)
                );

                var activeTextEditor = vscode.window.activeTextEditor;
                if (null !== activeTextEditor)
                {
                    //outputChannel.appendLine('fileName: ' +activeTextEditor.document.fileName);
                    //outputChannel.appendLine('text: ' +activeTextEditor.document.getText());
                    //outputChannel.appendLine('languageId: ' +activeTextEditor.document.languageId);
                    getWandboxCompilerName
                    (
                        activeTextEditor.document.languageId,
                        activeTextEditor.document.fileName,
                        name =>
                        {
                            if (name)
                            {
                                outputChannel.appendLine('HTTP POST http://melpon.org/wandbox/api/compile.json');
                                outputChannel.appendLine
                                (
                                    JSON.stringify
                                    (
                                        {
                                            compiler: name
                                        },
                                        null,
                                        4
                                    )
                                );
                                request
                                (
                                    {
                                        url: 'http://melpon.org/wandbox/api/compile.json',
                                        method: 'POST',
                                        headers:
                                        {
                                            //'Content-Type': 'application/json',
                                            'User-Agent': 'wandbox-vscode'
                                        },
                                        json:
                                        {
                                            compiler: name,
                                            code: activeTextEditor.document.getText(),
                                            from: 'wandbox-vscode'
                                        }
                                    },
                                    function(error, response, body)
                                    {
                                        if (response.statusCode)
                                        {
                                            outputChannel.appendLine('statusCode(HTTP): ' +response.statusCode);
                                        }
                                        if (!error && response.statusCode == 200)
                                        {
                                            //var result = JSON.parse(body);
                                            outputChannel.appendLine(JSON.stringify(body, null, 4));
                                        }
                                        else
                                        {
                                            outputChannel.appendLine(body);
                                            outputChannel.appendLine('error: ' +error);
                                        }
                                    }

                                );
                            }
                        }
                    );
                }
            }
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}