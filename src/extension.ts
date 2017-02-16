'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';
import * as fs from 'fs';

module rx
{
    class Result
    {
        public constructor
        (
            public error : any,
            public response : any,
            public body : any
        )
        {
        }
    }
    export function get(url : string) : Thenable<Result>
    {
        return new Promise<Result>
        (
            resolve => request.get
            (
                url,
                function(error, response, body)
                {
                    resolve
                    (
                        new Result
                        (
                            error,
                            response,
                            body
                        )
                    );
                }
            )
        );
    }
    export function execute(data : any) : Thenable<Result>
    {
        return new Promise<Result>
        (
            resolve => request
            (
                data,
                function(error, response, body)
                {
                    resolve
                    (
                        new Result
                        (
                            error,
                            response,
                            body
                        )
                    );
                }
            )
        );
    }
}

module fx
{
    class ReaddirResult
    {
        public constructor
        (
            public error : NodeJS.ErrnoException,
            public files : string[]
        )
        {
        }
    }
    export function readdir(path : string) : Thenable<ReaddirResult>
    {
        return new Promise<ReaddirResult>
        (
            resolve => fs.readdir
            (
                path,
                function(error : NodeJS.ErrnoException, files : string[])
                {
                    resolve
                    (
                        new ReaddirResult
                        (
                            error,
                            files
                        )
                    );
                }
            )
        );
    }
}

module WandboxVSCode
{
    const extentionName = "wandbox-vscode";
    var fileSetting = { };

    function deepCopy(source : any) : any
    {
        return JSON.parse(JSON.stringify(source));
    }

    function stripDirectory(path : string) : string
    {
        return path
            .split('\\').reverse()[0]
            .split('/').reverse()[0];
    }

    function getConfiguration(key ?: string) : any
    {
        var configuration = vscode.workspace.getConfiguration("wandbox");
        return key ?
            configuration[key]:
            configuration;
    }

    module OutputChannel
    {
        var outputChannel :vscode.OutputChannel;

        export function makeSure() :vscode.OutputChannel
        {
            if (!outputChannel)
            {
                outputChannel = vscode.window.createOutputChannel
                (
                    getConfiguration("outputChannelName")
                );
            }
            else
            {
                appendLine('');
            }
            return outputChannel;
        }

        export function bowWow() : void
        {
            show();
            appendLine(`🐾 Bow-wow! ${new Date().toString()}`);
        }

        export function show() : void
        {
            outputChannel.show();
        }
        export function appendLine(value : string) : void
        {
            outputChannel.appendLine(value);
        }

        export function appendJson(value : any) : void
        {
            OutputChannel.appendLine(JSON.stringify(value, null, 4));
        }
    }

    module WandboxServer
    {
        function getUrl() :string
        {
            var result : string;
            var setting = fileSetting[WorkSpace.getCurrentFilename()];
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
        }

        export function getWebUrl() :string
        {
            return getUrl() +`/?from=${extentionName}`;
        }

        export async function getList(callback : (list :any[]) => void) : Promise<void>
        {
            var requestUrl = getUrl() +`/api/list.json?from=${extentionName}`;
            OutputChannel.appendLine(`HTTP GET ${requestUrl}`);
            var result = await rx.get
            (
                requestUrl,
            );
            OutputChannel.appendLine(`statusCode: ${result.response.statusCode}`);
            if (result.error)
            {
                OutputChannel.appendLine(`🚫 error: ${result.error}`);
            }
            else
            if (result.response.statusCode === 200)
            {
                callback(list[getUrl()] = JSON.parse(result.body));
            }
        }

        var list : {[name : string] : any[] } = { };

        export function makeSureList(callback : (list :any[]) => void) : void
        {
            var key = getUrl();
            if (!list[key])
            {
                getList(body => callback(body));
            }
            else
            {
                callback(list[key]);
            }
        }

        function buildCompileJson(json : { }) : { }
        {
            var document : vscode.TextDocument = json['code'];
            var additionals : string[];
            var setting = fileSetting[document.fileName];
            if (setting)
            {
                additionals = setting['codes'];
            }
            var simplifyPostData = getConfiguration("simplifyPostData");
            if (simplifyPostData)
            {
                //  簡素化
                json['code'] = document.fileName;
                if (additionals)
                {
                    json['codes'] = additionals.join(',');
                }

                OutputChannel.appendJson(json);
            }
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
                                if (filename === stripDirectory(document.fileName))
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
            json['code'] = document.getText();
            json['from'] = extentionName;
            if (!simplifyPostData)
            {
                OutputChannel.appendJson(json);
            }
            
            return json;
        }

        export async function compile(json : { }) : Promise<void>
        {
            var requestUrl = getUrl() +`/api/compile.json`;
            OutputChannel.appendLine(`HTTP POST ${requestUrl}`);

            var startAt = new Date();
            var result = await rx.execute
            (
                {
                    url: requestUrl,
                    method: 'POST',
                    headers:
                    {
                        //'Content-Type': 'application/json',
                        'User-Agent': extentionName
                    },
                    json: buildCompileJson(json)
                }
            );
            var endAt = new Date();
            if (result.response.statusCode)
            {
                OutputChannel.appendLine(`HTTP statusCode: ${result.response.statusCode}`);
            }
            if (!result.error && result.response.statusCode === 200)
            {
                if (result.body.status)
                {
                    OutputChannel.appendLine(`status: ${result.body.status}`);
                }
                if (result.body.signal)
                {
                    OutputChannel.appendLine(`🚦 signal: ${result.body.signal}`);
                }
                if (result.body.compiler_output)
                {
                    OutputChannel.appendLine('compiler_output: ');
                    OutputChannel.appendLine(result.body.compiler_output);
                }
                if (result.body.compiler_error)
                {
                    OutputChannel.appendLine('🚫 compiler_error: ');
                    OutputChannel.appendLine(result.body.compiler_error);
                }
                //body.compiler_message
                //merged messages compiler_output and compiler_error
                if (result.body.program_output)
                {
                    OutputChannel.appendLine('program_output: ');
                    OutputChannel.appendLine(result.body.program_output);
                }
                if (result.body.program_error)
                {
                    OutputChannel.appendLine('🚫 program_error: ');
                    OutputChannel.appendLine(result.body.program_error);
                }
                //body.program_message
                //merged messages program_output and program_error
                //body.permlink && outputChannel.appendLine(`🔗 permlink: ${body.permlink}`);
                if (result.body.url)
                {
                    OutputChannel.appendLine(`🔗 url: ${result.body.url}`);
                    if (getConfiguration("autoOpenShareUrl"))
                    {
                        vscode.commands.executeCommand
                        (
                            'vscode.open',
                            vscode.Uri.parse(result.body.url)
                        );
                    }
                }

            }
            else
            {
                if (result.body)
                {
                    OutputChannel.appendLine(result.body);
                }
                if (result.error)
                {
                    OutputChannel.appendLine(`🚫 error: ${result.error}`);
                }
            }
            OutputChannel.appendLine(`🏁 time: ${(endAt.getTime() -startAt.getTime()) /1000} s`);
        }
    }

    module WorkSpace
    {
        export function IsOpenFiles(files : string[]) : boolean
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
                            hit = hit || file === stripDirectory(document.fileName);
                        }
                    );
                    if (!hit)
                    {
                        hasError = true;
                        OutputChannel.appendLine(`🚫 Not found file: ${file} ( If opened, show this file once. And keep to open it.)`);
                    }
                }
            );
            return !hasError;
        }

        export function getActiveDocument() :vscode.TextDocument
        {
            var activeTextEditor = vscode.window.activeTextEditor;
            if (null !== activeTextEditor && undefined !== activeTextEditor)
            {
                var document = activeTextEditor.document;
                if (null !== document && undefined !== document)
                {
                    return document;
                }
            }
            return null;
        };

        export function getCurrentFilename() : string
        {
            var result : string;
            var document = getActiveDocument();
            if (null !== document)
            {
                result = document.fileName;
            }
            if (!result)
            {
                result = "wandbox-vscode:default";
            }
            return result;
        }

        export function showJson(titile : string, json : any) : void
        {
            var provider = vscode.workspace.registerTextDocumentContentProvider
            (
                'wandbox-vscode-json',
                new class implements vscode.TextDocumentContentProvider
                {
                    provideTextDocumentContent(_uri: vscode.Uri, _token: vscode.CancellationToken)
                        : string | Thenable<string>
                    {
                        return JSON.stringify(json, null, 4);
                    }
                }
            );
            var date = new Date(); // 結果がキャッシュされようにする為
            var stamp = date.getFullYear().toString()
                +("0" +(date.getMonth() +1).toString()).slice(-2)
                +("0" +date.getDate().toString()).slice(-2)
                +"-"
                +("0" +date.getHours().toString()).slice(-2)
                +("0" +date.getMinutes().toString()).slice(-2)
                +("0" +date.getSeconds().toString()).slice(-2);
            vscode.workspace.openTextDocument
            (
                vscode.Uri.parse(`wandbox-vscode-json://wandbox-vscode/${stamp}/${titile}.json`)
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
    }

    function getWandboxCompilerName(vscodeLang :string, fileName :string) :string
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
            result = getConfiguration("extensionCompilerMapping")[fileName.split('.').reverse()[0]];
        }
        return result;
    }

    function showWandboxSettings() : void
    {
        WorkSpace.showJson
        (
            "setting",
            {
                "basicSetting": getConfiguration(),
                "fileSetting": fileSetting
            }
        );
    }

    function showWandboxWeb() : void
    {
        vscode.commands.executeCommand
        (
            'vscode.open',
            vscode.Uri.parse(WandboxServer.getWebUrl())
        );
    }

    function showWandboxCompiers() : void
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        WandboxServer.makeSureList
        (
            list =>
            {
                if (list)
                {
                    var languageNames :string[] = [];
                    list.forEach(item => languageNames.push(item.language));
                    languageNames = languageNames.filter((value, i, self) => self.indexOf(value) === i);
                    languageNames.sort();
                    var languages = {};
                    languageNames.forEach(item => languages[item] = languages[item] || []);
                    list.forEach
                    (
                        item =>
                        {
                            var displayItem = deepCopy(item);
                            delete displayItem.switches;
                            languages[displayItem.language].push(displayItem);
                        }
                    );
                    languageNames.forEach
                    (
                        language =>
                        {
                            OutputChannel.appendLine(`📚 ${language}`);
                            languages[language].forEach
                            (
                                item =>
                                {
                                    var displayItem = deepCopy(item);
                                    delete displayItem.switches;
                                    OutputChannel.appendLine(`${item.name}\t${JSON.stringify(displayItem)}`);
                                }
                            );
                        }
                    );
                }
            }
        );
    }

    function showWandboxOptions() : void
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            var compilerName = getWandboxCompilerName
            (
                document.languageId,
                document.fileName
            );
            if (compilerName)
            {
                WandboxServer.makeSureList
                (
                    list =>
                    {
                        var hit :any;
                        if (list)
                        {
                            list.forEach
                            (
                                item =>
                                {
                                    if (compilerName === item.name)
                                    {
                                        hit = item;
                                    }
                                }
                            );
                        }

                        if (!hit)
                        {
                            OutputChannel.appendLine('🚫 Unknown compiler!');
                            OutputChannel.appendLine('👉 You can set a compiler by [Wandbox: Set Compiler] command.');
                            OutputChannel.appendLine('👉 You can see compilers list by [Wandbox: Show Compilers] command.');
                        }
                        else
                        {
                            if (!hit.switches || 0 === hit.switches.length)
                            {
                                OutputChannel.appendLine('this compiler has no options');
                            }
                            else
                            {
                                OutputChannel.appendLine('option\tdetails');
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
                                                    OutputChannel.appendLine(`${item.name}\t${JSON.stringify(item)}`);
                                                }
                                            );
                                        }
                                        else
                                        {
                                            OutputChannel.appendLine(`${item.name}\t${JSON.stringify(item)}`);
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
                OutputChannel.appendLine('🚫 Unknown language!');
                OutputChannel.appendLine('👉 You can use set a compiler by [Wandbox: Set Compiler] command.');
                OutputChannel.appendLine('👉 You can see compilers list by [Wandbox: Show Compilers] command.');
            }
        }
        else
        {
            OutputChannel.appendLine('🚫 No active text editor!');
        }
    }
    
    function showWandboxListJson() : void
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        WandboxServer.getList
        (
            body => WorkSpace.showJson
            (
                "list",
                body
            )
        );
    }
    
    function setSetting(name : string, prompt: string) : void
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            var fileName = document.fileName;
            vscode.window.showInputBox({ prompt:prompt }).then
            (
                value =>
                {
                    if (value)
                    {
                        fileSetting[fileName] = fileSetting[fileName] || { };
                        if ('additionals' === name)
                        {
                            var newFiles = value.split(',');
                            if (WorkSpace.IsOpenFiles(newFiles))
                            {
                                fileSetting[fileName][name] = newFiles;
                                OutputChannel.appendLine(`Set ${name} "${newFiles.join('","')}" for "${fileName}"`);
                            }
                        }
                        else
                        if (name)
                        {
                            try
                            {
                                fileSetting[fileName][name] = JSON.parse(`"${value}"`);
                                OutputChannel.appendLine(`Set ${name} "${value}" for "${fileName}"`);
                            }
                            catch(Err)
                            {
                                OutputChannel.appendLine(`🚫 ${Err}`);
                            }
                        }
                        else
                        {
                            try
                            {
                                fileSetting[fileName] = JSON.parse(value);
                                OutputChannel.appendLine(`Set settings for "${fileName}"`);
                                OutputChannel.appendJson(fileSetting[fileName]);
                            }
                            catch(Err)
                            {
                                OutputChannel.appendLine(`🚫 ${Err}`);
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
            OutputChannel.appendLine('🚫 No active text editor!');
        }
    }

    function resetWandboxFileSettings() : void
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            var fileName = document.fileName;
            if (fileSetting[fileName])
            {
                delete fileSetting[fileName];
                OutputChannel.appendLine(`Reset settings for "${fileName}"`);
            }
            else
            {
                OutputChannel.appendLine(`⚠️ Not found settings for "${fileName}"`);
            }
        }
        else
        {
            OutputChannel.appendLine('🚫 No active text editor!');
        }
    }
    
    function invokeWandbox(args ?: any) : void
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            var compilerName = getWandboxCompilerName
            (
                document.languageId,
                document.fileName
            );
            var additionals : string[];
            var options : string = getConfiguration("options")[compilerName];
            var stdIn : string;
            var compilerOptionRaw : string = getConfiguration("compilerOptionRaw")[compilerName];
            var runtimeOptionRaw : string = getConfiguration("runtimeOptionRaw")[compilerName];
            var setting = fileSetting[document.fileName];
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
                var json =
                {
                    compiler: compilerName,
                    code: document
                };
                if (additionals)
                {
                    if (!WorkSpace.IsOpenFiles(additionals))
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
                WandboxServer.compile(json);
            }
            else
            {
                OutputChannel.appendLine('🚫 Unknown language!');
                OutputChannel.appendLine('👉 You can use set a compiler by [Wandbox: Set Compiler] command.');
                OutputChannel.appendLine('👉 You can see compilers list by [Wandbox: Show Compilers] command.');
            }
        }
        else
        {
            OutputChannel.appendLine('🚫 No active text editor!');
        }
    }
    
    var newDocument =
    {
        text: null,
        fileExtension: null
    };

    async function getHelloWorldFiles() : Promise<vscode.QuickPickItem[]>
    {
        var extensionPath = vscode.extensions.getExtension("wraith13.wandbox-vscode").extensionPath;
        var userFiles : string[];
        userFiles = getConfiguration("helloWolrdFiles");
        var fileExtensionQuickPickList : vscode.QuickPickItem[] = [];
        var result = await fx.readdir(`${extensionPath}/hellos`);
        if (result.error)
        {
            OutputChannel.appendLine("🚫 " + result.error.message);
        }
        else
        {
            const hello = "hello.";
            userFiles.forEach
            (
                (i : string ) =>
                {
                    fileExtensionQuickPickList.push
                    (
                        {
                            "label": stripDirectory(i),
                            "description": i,
                            "detail": null
                        }
                    );
                }
            );
            result.files.forEach
            (
                (i : string) => 
                {
                    if (i.startsWith(hello))
                    {
                        fileExtensionQuickPickList.push
                        (
                            {
                                "label": i,
                                "description": `${extensionPath}/hellos/${i}`,
                                "detail": null
                            }
                        );
                    }
                }
            );
        }
        return fileExtensionQuickPickList;
    }

    async function helloWandbox() : Promise<void>
    {
        OutputChannel.makeSure();
        OutputChannel.bowWow();

        var select = await vscode.window.showQuickPick
        (
            getHelloWorldFiles(),
            {
                placeHolder: "Select a [hello, world!] file",
                matchOnDescription: true
            }
        );
        if (select)
        {
            //var fileExtension = select.label;
            var helloFilePath = select.description;
            OutputChannel.appendLine(`✨️ Open a [hello, world!] as a new file. ( Source is "${helloFilePath}" )`);
            fs.exists
            (
                helloFilePath,
                (exists : boolean) =>
                {
                    if (exists)
                    {
                        fs.readFile
                        (
                            helloFilePath, (err : NodeJS.ErrnoException, data : Buffer) =>
                            {
                                if (err)
                                {
                                    OutputChannel.appendLine("🚫 " + err.message);
                                }
                                else
                                {
                                    newDocument.text = data.toString();
                                    newDocument.fileExtension = helloFilePath.split('.').reverse()[0];

                                    //  ドキュメント上は vscode.workspace.openTextDocument() で language を指定して新規ファイルオープン
                                    //  できることになってるっぽいんだけど、実際にそういうことができないので代わりに workbench.action.files.newUntitledFile
                                    //  を使っている。 untitled: を使ったやり方は保存予定の実パスを指定する必要があり、ここの目的には沿わない。

                                    //  language を指定して新規ファイルオープンできるようになったらその方法での実装に切り替えることを検討すること。

                                    vscode.commands.executeCommand("workbench.action.files.newUntitledFile")
                                    .then
                                    (
                                        (_value :{} ) =>
                                        {
                                            //  ここでは新規オープンされた document 周りの情報がなにも取得できないのでなにもできない。
                                            //  なので　vscode.window.onDidChangeActiveTextEditor　で処理している。
                                        }
                                    );
                        
                                }
                            }
                        );
                    }
                    else
                    {
                        OutputChannel.appendLine("🚫 Unknown file extension!");
                        OutputChannel.appendLine('👉 You can set hello world files by [wandbox.helloWolrdFiles] setting.');
                    }
                }
            );
        }
    }

    export function registerCommand(context: vscode.ExtensionContext) : void
    {
        [
            {
                command: 'extension.showWandboxSettings',
                callback: showWandboxSettings
            },
            {
                command: 'extension.showWandboxWeb',
                callback: showWandboxWeb
            },
            {
                command: 'extension.showWandboxCompiers',
                callback: showWandboxCompiers
            },
            {
                command: 'extension.showWandboxOptions',
                callback: showWandboxOptions
            },
            {
                command: 'extension.showWandboxListJson',
                callback: showWandboxListJson
            },
            {
                command: 'extension.setWandboxFileServer',
                callback: () => setSetting('server', 'Enter server url')
            },
            {
                command: 'extension.setWandboxFileCompiler',
                callback: () => setSetting('compiler', 'Enter compiler name')
            },
            {
                command: 'extension.setWandboxFileAdditionals',
                callback: () => setSetting('codes', 'Enter file names ( just file names without directory )')
            },
            {
                command: 'extension.setWandboxFileStdIn',
                callback: () => setSetting('stdin', 'Enter stdin text ( When you want to user multiline text, Use [Wandbox: Set Settings JSON] command. )')
            },
            {
                command: 'extension.setWandboxFileOptions',
                callback: () => setSetting('options', 'Enter compiler option ( You can see compiler option list by [Wandbox: Show Compier Info] )')
            },
            {
                command: 'extension.setWandboxFileCompilerOptionRaw',
                callback: () => setSetting('compiler-option-raw', 'Enter compiler option raw')
            },
            {
                command: 'extension.setWandboxFileRuntimeOptionRaw',
                callback: () => setSetting('runtime-option-raw', 'Enter runtime option raw')
            },
            {
                command: 'extension.setWandboxFileSettingJson',
                callback: () => setSetting(null, 'Enter settings JSON')
            },
            {
                command: 'extension.resetWandboxFileSettings',
                callback: resetWandboxFileSettings
            },
            {
                command: 'extension.invokeWandbox',
                callback: () => invokeWandbox()
            },
            {
                command: 'extension.shareWandbox',
                callback: () => invokeWandbox({ share: true })
            },
            {
                command: 'extension.helloWandbox',
                callback: helloWandbox
            }
        ]
        .forEach
        (
            i =>
            context.subscriptions.push
            (
                vscode.commands.registerCommand
                (
                    i.command,
                    i.callback
                )
            )
        );

        vscode.workspace.onDidCloseTextDocument
        (
            (document : vscode.TextDocument) =>
            {
                if (document.isUntitled && fileSetting[document.fileName])
                {
                    delete fileSetting[document.fileName];
                }
            }
        );

        vscode.window.onDidChangeActiveTextEditor
        (
            (textEditor : vscode.TextEditor) =>
            {
                if (textEditor.document.isUntitled && newDocument.text)
                {
                    var text = newDocument.text;
                    var activeTextEditor = vscode.window.activeTextEditor;
                    activeTextEditor.edit
                    (
                        (editBuilder: vscode.TextEditorEdit) =>
                        {
                            editBuilder.insert(new vscode.Position(0,0), text);
                        }
                    );
                    var document = WorkSpace.getActiveDocument();
                    var fileName = document.fileName;
                    var compiler = getConfiguration("extensionCompilerMapping")[newDocument.fileExtension];
                    if (compiler)
                    {
                        fileSetting[fileName] = fileSetting[fileName] || { };
                        fileSetting[fileName]['compiler'] = compiler;
                    }

                    newDocument.text = null;
                    newDocument.fileExtension = null;
                }
            }
        );
    }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{
    WandboxVSCode.registerCommand(context);
}

// this method is called when your extension is deactivated
export function deactivate()
{
}