'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    const extentionName = "wandbox-vscode";
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
    var fileSetting = [ ];
    var getWandboxCompilerName = (vscodeLang :string, fileName :string) :string =>
    {
        var hit : string;
        var setting = fileSetting[fileName];
        if (setting)
        {
            hit = setting.compilerName;
        }
        if (!hit)
        {
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
        }
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
        return hit;
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
        outputChannel.appendLine(`🐾 Bow-wow! ${new Date().toString()}`);
    };
    var getList = (callback : (string) => void) =>
    {
        outputChannel.appendLine(`HTTP GET http://melpon.org/wandbox/api/list.json?from=${extentionName}`);
        request.get
        (
            `http://melpon.org/wandbox/api/list.json?from=${extentionName}`,
            function(error, response, body)
            {
                if (!error && response.statusCode == 200)
                {
                    callback(body);
                }
                else
                if (response.statusCode)
                {
                    outputChannel.appendLine(`statusCode: ${response.statusCode}`);
                }
                else
                {
                    outputChannel.appendLine(`error: ${error}`);
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
    console.log(`Congratulations, your extension "${extentionName}" is now active!`);

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
                    vscode.Uri.parse(`http://melpon.org/wandbox/?from=${extentionName}`)
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
                    list =>
                    {
                        if (list)
                        {
                            outputChannel.appendLine('compiler\tlanguage');
                            list.forEach
                            (
                                item => outputChannel.appendLine(`${item.name}\t${item.language}`)
                            )
                        }
                    }
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
    var stripDirectory = (path : string) =>
    {
        return path
            .split('¥').reverse()[0]
            .split('/').reverse()[0];
    };
    var setSetting = (name : string, prompt: string) =>
    {
        makeSureOutputChannel();
        bowWow();

        var activeTextEditor = vscode.window.activeTextEditor;
        if (null !== activeTextEditor)
        {
            var fileName = activeTextEditor.document.fileName;
            vscode.window.showInputBox({ prompt:prompt }).then
            (
                value =>
                {
                    if (value)
                    {
                        fileSetting[fileName] = fileSetting[fileName] || { };
                        if ('additionals' == name)
                        {
                            var hasError = false;
                            var newFiles = [];
                            value.split(',').forEach
                            (
                                file =>
                                {
                                    var hit = false;
                                    vscode.workspace.textDocuments.forEach
                                    (
                                        document =>
                                        {
                                            hit = hit || file == stripDirectory(document.fileName);
                                        }
                                    )
                                    if (hit)
                                    {
                                        newFiles.push(file);
                                    }
                                    else
                                    {
                                        hasError = true;
                                        outputChannel.appendLine(`🚫 Not found file: ${file} ( If opened, show this file once. And keep to open it.)`);
                                    }
                                }
                            );
                            if (!hasError)
                            {
                                fileSetting[fileName][name] = newFiles;
                                outputChannel.appendLine(`Set ${name} "${newFiles.join('","')}" for "${fileName}"`);
                            }
                        }
                        else
                        if (name)
                        {
                            fileSetting[fileName][name] = value;
                            outputChannel.appendLine(`Set ${name} "${value}" for "${fileName}"`);
                        }
                        else
                        {
                            try
                            {
                                fileSetting[fileName] = JSON.parse(value);
                                outputChannel.appendLine(`Set settings for "${fileName}"`);
                                outputChannel.appendLine(JSON.stringify(fileSetting[fileName], null, 4));
                            }
                            catch(Err)
                            {
                                outputChannel.appendLine(`🚫 ${Err}`);
                            }
                        }
                    }
                    else
                    {
                        fileSetting[fileName][name] = null;
                    }
                }
            );
        }
        else
        {
            outputChannel.appendLine('🚫 No active text editor!');
        }
    };
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileCompiler',
            () => setSetting('compilerName', 'Enter compiler name')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileAdditionals',
            () => setSetting('additionals', 'Enter file names ( just file names without directory )')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileStdIn',
            () => setSetting('stdIn', 'Enter stdin text ( When you want to user multiline text, Use [Wandbox: Set Settings JSON] command. )')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileOptions',
            () => setSetting('options', 'Enter compiler option ( You can see compiler option list by [Wandbox: Show Compier Info] )')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileCompilerOptionRaw',
            () => setSetting('compilerOptionRaw', 'Enter compiler option raw')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileRuntimeOptionRaw',
            () => setSetting('runtimeOptionRaw', 'Enter runtime option raw')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileSettingJson',
            () => setSetting(null, 'Enter settings JSON')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.resetWandboxFileSettings',
            () =>
            {
                makeSureOutputChannel();
                bowWow();

                var activeTextEditor = vscode.window.activeTextEditor;
                if (null !== activeTextEditor)
                {
                    var fileName = activeTextEditor.document.fileName;
                    if (fileSetting[fileName])
                    {
                        delete fileSetting[fileName];
                        outputChannel.appendLine(`Reset settings for "${fileName}"`);
                    }
                    else
                    {
                        outputChannel.appendLine(`⚠️ Not found settings for "${fileName}"`);
                    }
                }
                else
                {
                    outputChannel.appendLine('🚫 No active text editor!');
                }
            }
        )
    );
    var invokeWandbox = (args ?: any) =>
    {
        makeSureOutputChannel();
        bowWow();

        var activeTextEditor = vscode.window.activeTextEditor;
        if (null !== activeTextEditor)
        {
            activeTextEditor.document
            //outputChannel.appendLine('fileName: ' +activeTextEditor.document.fileName);
            //outputChannel.appendLine('text: ' +activeTextEditor.document.getText());
            //outputChannel.appendLine('languageId: ' +activeTextEditor.document.languageId);
            var compilerName = getWandboxCompilerName
            (
                activeTextEditor.document.languageId,
                activeTextEditor.document.fileName
            );

            if (compilerName)
            {
                outputChannel.appendLine('HTTP POST http://melpon.org/wandbox/api/compile.json');
                var json =
                {
                    compiler: compilerName
                };
                if (args && args.share)
                {
                    json['save'] = true;
                }
                outputChannel.appendLine(JSON.stringify(json, null, 4));
                json['code'] = activeTextEditor.document.getText();
                json['from'] = extentionName;
                var startAt = new Date();
                request
                (
                    {
                        url: 'http://melpon.org/wandbox/api/compile.json',
                        method: 'POST',
                        headers:
                        {
                            //'Content-Type': 'application/json',
                            'User-Agent': extentionName
                        },
                        json: json
                    },
                    function(error, response, body)
                    {
                        var endAt = new Date();
                        if (response.statusCode)
                        {
                            outputChannel.appendLine(`HTTP statusCode: ${response.statusCode}`);
                        }
                        if (!error && response.statusCode == 200)
                        {
                            body.status && outputChannel.appendLine(`status: ${body.status}`);
                            body.signal && outputChannel.appendLine(`🚦 signal: ${body.signal}`);
                            if (body.compiler_output)
                            {
                                outputChannel.appendLine('compiler_output: ');
                                outputChannel.appendLine(body.compiler_output);
                            }
                            if (body.compiler_error)
                            {
                                outputChannel.appendLine('🚫 compiler_error: ');
                                outputChannel.appendLine(body.compiler_error);
                            }
                            //body.compiler_message
                            //merged messages compiler_output and compiler_error
                            if (body.program_output)
                            {
                                outputChannel.appendLine('program_output: ');
                                outputChannel.appendLine(body.program_output);
                            }
                            if (body.program_error)
                            {
                                outputChannel.appendLine('🚫 program_error: ');
                                outputChannel.appendLine(body.program_error);
                            }
                            //body.program_message
                            //merged messages program_output and program_error
                            //body.permlink && outputChannel.appendLine(`🔗 permlink: ${body.permlink}`);
                            body.url && outputChannel.appendLine(`🔗 url: ${body.url}`);

                        }
                        else
                        {
                            outputChannel.appendLine(body);
                            outputChannel.appendLine(`🚫 error: ${error}`);
                        }
                        outputChannel.appendLine(`🏁 time: ${(endAt.getTime() -startAt.getTime()) /1000} s`);
                    }
                );
            }
            else
            {
                outputChannel.appendLine('🚫 Unknown language!');
                outputChannel.appendLine('👉 You can use set a compiler by [Wandbox: Set Compiler] command.');
                outputChannel.appendLine('👉 You can see compilers list by [Wandbox: List Compilers] command.');
            }
        }
        else
        {
            outputChannel.appendLine('🚫 No active text editor!');
        }
    }
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.invokeWandbox',
            () => invokeWandbox()
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.shareWandbox',
            () => invokeWandbox({ share: true })
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}