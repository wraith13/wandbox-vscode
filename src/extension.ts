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
    var fileSetting = { };
    var deepCopy = (source : any) : any =>
    {
        return JSON.parse(JSON.stringify(source));
    };
    var showJson = (titile : string, json : any) =>
    {
        var provider = vscode.workspace.registerTextDocumentContentProvider
        (
            'wandbox-vscode-json',
            new class implements vscode.TextDocumentContentProvider
            {
                provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken)
                    : string | Thenable<string>
                {
                    return JSON.stringify(json, null, 4);
                }
            }
        );
        vscode.workspace.openTextDocument
        (
            vscode.Uri.parse(`wandbox-vscode-json://wandbox-vscode/${titile}.json`)
        )
        .then
        (
            (value: vscode.TextDocument) =>
            {
                vscode.window.showTextDocument(value);
                provider.dispose();
            }
        );
    };
    var getConfiguration = (key ?: string) : any =>
    {
        var configuration = vscode.workspace.getConfiguration("wandbox");
        return key ?
            configuration[key]:
            configuration;
    };
    var getCurrentFilename = () : string =>
    {
        var result : string;
        var activeTextEditor = vscode.window.activeTextEditor;
        if (null !== activeTextEditor)
        {
            result = activeTextEditor.document.fileName;
        }
        if (!result)
        {
            result = "wandbox-vscode:default";
        }
        return result;
    };
    var getWandboxServerUrl = () :string =>
    {
        var result : string;
        var setting = fileSetting[getCurrentFilename()];
        if (setting)
        {
            result = setting.server;
        }
        if (!result)
        {
            result = getConfiguration("defaultServer");
        }
        if (result.endsWith("/"))
        {
            result = result.substr(0, result.length -1);
        }
        return result;
    };
    var getWandboxCompilerName = (vscodeLang :string, fileName :string) :string =>
    {
        var result : string;
        var setting = fileSetting[fileName];
        if (setting)
        {
            result = setting.compiler;
        }
        if (!result && vscodeLang)
        {
            result = getConfiguration("languageCompilerMapping")[vscodeLang];
        }
        if (!result && fileName)
        {
            var elements = fileName.split('.');
            if (2 <= elements.length)
            {
                var extension = elements[elements.length -1];
                result = getConfiguration("extensionCompilerMapping")[extension];
            }
        }
        return result;
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
        var requestUrl = getWandboxServerUrl() +`/api/list.json?from=${extentionName}`;
        outputChannel.appendLine(`HTTP GET ${requestUrl}`);
        request.get
        (
            requestUrl,
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
    var list : {[name : string] : any[] } = { };
    var makeSureList = (callback : (list :any[]) => void) =>
    {
        var key = getWandboxServerUrl();
        if (!list[key])
        {
            getList(body => callback(list[key] = JSON.parse(body)));
        }
        else
        {
            callback(list[key]);
        }
    };

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log(`Congratulations, your extension "${extentionName}" is now active!`);

    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.showWandboxSettings',
            () => showJson
            (
                "setting",
                {
                    "basicSetting": getConfiguration(),
                    "fileSetting": fileSetting
                }
            )
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.showWandboxWeb',
            () =>
            {
                vscode.commands.executeCommand
                (
                    'vscode.open',
                    vscode.Uri.parse(getWandboxServerUrl() +`/?from=${extentionName}`)
                );
            }
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.showWandboxCompiers',
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
                            outputChannel.appendLine('compiler\tdetails');
                            list.forEach
                            (
                                item =>
                                {
                                    var displayItem = deepCopy(item);
                                    delete displayItem.switches;
                                    outputChannel.appendLine(`${item.name}\t${JSON.stringify(displayItem)}`);
                                }
                            );
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
            'extension.showWandboxOptions',
            () =>
            {
                makeSureOutputChannel();
                bowWow();

                var activeTextEditor = vscode.window.activeTextEditor;
                if (activeTextEditor)
                {
                    var compilerName = getWandboxCompilerName
                    (
                        activeTextEditor.document.languageId,
                        activeTextEditor.document.fileName
                    );
                    if (compilerName)
                    {
                        makeSureList
                        (
                            list =>
                            {
                                var hit :any;
                                list && list.forEach
                                (
                                    item =>
                                    {
                                        if (compilerName == item.name)
                                        {
                                            hit = item;
                                        }
                                    }
                                );

                                if (!hit)
                                {
                                    outputChannel.appendLine('🚫 Unknown compiler!');
                                    outputChannel.appendLine('👉 You can use set a compiler by [Wandbox: Set Compiler] command.');
                                    outputChannel.appendLine('👉 You can see compilers list by [Wandbox: Show Compilers] command.');
                                }
                                else
                                {
                                    if (!hit.switches || 0 == hit.switches.length)
                                    {
                                        outputChannel.appendLine('this compiler has no options');
                                    }
                                    else
                                    {
                                        outputChannel.appendLine('option\tdetails');
                                        hit.switches.forEach
                                        (
                                            item =>
                                            {
                                                if (item.options)
                                                {
                                                    item.options.forEach
                                                    (
                                                        item =>
                                                        {
                                                            outputChannel.appendLine(`${item.name}\t${JSON.stringify(item)}`);
                                                        }
                                                    );
                                                }
                                                else
                                                {
                                                    outputChannel.appendLine(`${item.name}\t${JSON.stringify(item)}`);
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        );
                    }
                    else
                    {
                        outputChannel.appendLine('🚫 Unknown language!');
                        outputChannel.appendLine('👉 You can use set a compiler by [Wandbox: Set Compiler] command.');
                        outputChannel.appendLine('👉 You can see compilers list by [Wandbox: Show Compilers] command.');
                    }
                }
                else
                {
                    outputChannel.appendLine('🚫 No active text editor!');
                }
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
                    body => showJson
                    (
                        "list",
                        list[getWandboxServerUrl()] = JSON.parse(body)
                    )
                );
            }
        )
    );
    var stripDirectory = (path : string) =>
    {
        return path
            .split('\\').reverse()[0]
            .split('/').reverse()[0];
    };
    var IsOpenFiles = (files : string[]) =>
    {
        var hasError = false;
        files.forEach
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
                );
                if (!hit)
                {
                    hasError = true;
                    outputChannel.appendLine(`🚫 Not found file: ${file} ( If opened, show this file once. And keep to open it.)`);
                }
            }
        );
        return !hasError;
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
                            var newFiles = value.split(',');
                            if (IsOpenFiles(newFiles))
                            {
                                fileSetting[fileName][name] = newFiles;
                                outputChannel.appendLine(`Set ${name} "${newFiles.join('","')}" for "${fileName}"`);
                            }
                        }
                        else
                        if (name)
                        {
                            try
                            {
                                fileSetting[fileName][name] = JSON.parse(`"${value}"`);
                                outputChannel.appendLine(`Set ${name} "${value}" for "${fileName}"`);
                            }
                            catch(Err)
                            {
                                outputChannel.appendLine(`🚫 ${Err}`);
                            }
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
            'extension.setWandboxFileServer',
            () => setSetting('server', 'Enter server url')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileCompiler',
            () => setSetting('compiler', 'Enter compiler name')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileAdditionals',
            () => setSetting('codes', 'Enter file names ( just file names without directory )')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileStdIn',
            () => setSetting('stdin', 'Enter stdin text ( When you want to user multiline text, Use [Wandbox: Set Settings JSON] command. )')
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
            () => setSetting('compiler-option-raw', 'Enter compiler option raw')
        )
    );
    context.subscriptions.push
    (
        vscode.commands.registerCommand
        (
            'extension.setWandboxFileRuntimeOptionRaw',
            () => setSetting('runtime-option-raw', 'Enter runtime option raw')
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
            var compilerName = getWandboxCompilerName
            (
                activeTextEditor.document.languageId,
                activeTextEditor.document.fileName
            );
            var additionals : string[];
            var options : string = getConfiguration("options")[compilerName];
            var stdIn : string;
            var compilerOptionRaw : string = getConfiguration("compilerOptionRaw")[compilerName];
            var runtimeOptionRaw : string = getConfiguration("runtimeOptionRaw")[compilerName];
            var setting = fileSetting[activeTextEditor.document.fileName];
            if (setting)
            {
                additionals = setting['codes'];
                if (undefined !== setting['options'])
                {
                    options = setting['options'];
                }
                stdIn = setting['stdin'];
                if (undefined !== setting['compiler-option-raw'])
                {
                    compilerOptionRaw = setting['compiler-option-raw'];
                }
                if (undefined !== setting['runtime-option-raw'])
                {
                    runtimeOptionRaw = setting['runtime-option-raw'];
                }
            }

            if (compilerName)
            {
                var requestUrl = getWandboxServerUrl() +`/api/compile.json`;
                outputChannel.appendLine(`HTTP POST ${requestUrl}`);
                var json =
                {
                    compiler: compilerName
                };
                if (additionals)
                {
                    if (!IsOpenFiles(additionals))
                    {
                        return;
                    }
                    //  ログ表示用のダミー。実際にPOSTするデータはこの後で再設定。
                    json['codes'] = additionals.join(',');
                }
                if (options)
                {
                    json['options'] = options;
                }
                if (stdIn)
                {
                    json['stdin'] = stdIn;
                }
                if (compilerOptionRaw)
                {
                    json['compiler-option-raw'] = compilerOptionRaw;
                }
                if (runtimeOptionRaw)
                {
                    json['runtime-option-raw'] = runtimeOptionRaw;
                }
                if (args && args.share)
                {
                    json['save'] = true;
                }
                outputChannel.appendLine(JSON.stringify(json, null, 4));
                if (additionals)
                {
                    json['codes'] = [];
                    additionals.forEach
                    (
                        filename =>
                        {
                            var code : string;
                            vscode.workspace.textDocuments.forEach
                            (
                                document =>
                                {
                                    if (filename == stripDirectory(document.fileName))
                                    {
                                        code = document.getText();
                                    }
                                }
                            );
                            json['codes'].push
                            (
                                {
                                    'file': filename,
                                    'code': code
                                }
                            );
                        }
                    );
                }
                json['code'] = activeTextEditor.document.getText();
                json['from'] = extentionName;
                var startAt = new Date();
                request
                (
                    {
                        url: requestUrl,
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
                            if (body.url)
                            {
                                outputChannel.appendLine(`🔗 url: ${body.url}`);
                                if (getConfiguration("autoOpenShareUrl"))
                                {
                                    vscode.commands.executeCommand
                                    (
                                        'vscode.open',
                                        vscode.Uri.parse(body.url)
                                    );
                                }
                            }

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
                outputChannel.appendLine('👉 You can see compilers list by [Wandbox: Show Compilers] command.');
            }
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