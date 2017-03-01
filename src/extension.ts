'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';
import * as fs from 'fs';

module rx
{
    export function get(url : string)
        : Thenable<{ error : any, response : any, body : any}>
    {
        return new Promise
        (
            resolve => request.get
            (
                url,
                (error, response, body) => resolve
                (
                    {
                        error,
                        response,
                        body
                    }
                )
            )
        );
    }
    export function execute(data : any)
        : Thenable<{ error : any, response : any, body : any}>
    {
        return new Promise
        (
            resolve => request
            (
                data,
                (error, response, body) => resolve
                (
                    {
                        error,
                        response,
                        body
                    }
                )
            )
        );
    }
}

module fx
{
    export function readdir(path : string)
        : Thenable<{ error : NodeJS.ErrnoException, files : string[] }>
    {
        return new Promise
        (
            resolve => fs.readdir
            (
                path,
                (error : NodeJS.ErrnoException, files : string[]) => resolve
                (
                    {
                        error,
                        files
                    }
                )
            )
        );
    }

    export function exists(path : string) : Thenable<boolean>
    {
        return new Promise
        (
            resolve => fs.exists
            (
                path,
                exists => resolve(exists)
            )
        );
    }

    export function readFile(path : string)
        : Thenable<{ err : NodeJS.ErrnoException, data : Buffer }>
    {
        return new Promise
        (
            resolve => fs.readFile
            (
                path,
                (err : NodeJS.ErrnoException, data : Buffer) => resolve({ err, data })
            )
        );
    }
}

module WandboxVSCode
{
    const extentionName = "wandbox-vscode";
    var fileSetting = { };
    var pass_through;

    function stripDirectory(path : string) : string
    {
        return path
            .split('\\').reverse()[0]
            .split('/').reverse()[0];
    }

    function getConfiguration<type>(key ?: string) : type
    {
        var configuration = vscode.workspace.getConfiguration("wandbox");
        return key ?
            configuration[key]:
            configuration;
    }

    function emoji(key : string) : string
    {
        var result : string = getConfiguration("emoji")[key];
        if (result)
        {
            result += " ";
        }
        else
        {
            result = "";
        }
        return result;
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
                    getConfiguration<string>("outputChannelName")
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
            appendLine(`${emoji("stamp")}Bow-wow! ${new Date().toString()}`);
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

        export function canceled() : void
        {
            appendLine(`Canceled`);
        }
    }

    module WandboxServer
    {
        export function getServer() : string
        {
            var result : string;
            var setting = fileSetting[WorkSpace.getCurrentFilename()];
            if (setting)
            {
                result = setting.server;
            }
            if (!result)
            {
                result = getConfiguration<string[]>("Servers")[0];
            }
            return result;
        }

        function getUrl() :string
        {
            var result : string = getServer();
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

        export async function getList() : Promise<any[]>
        {
            return new Promise<any[]>
            (
                async (resolve, reject) =>
                {
                    var requestUrl = getUrl() +`/api/list.json?from=${extentionName}`;
                    OutputChannel.appendLine(`HTTP GET ${requestUrl}`);
                    let { error, response, body } = await rx.get
                    (
                        requestUrl,
                    );
                    OutputChannel.appendLine(`statusCode: ${response.statusCode}`);
                    if (error)
                    {
                        OutputChannel.appendLine(`${emoji("error")}error: ${error}`);
                        reject(error);
                    }
                    else
                    if (response.statusCode === 200)
                    {
                        resolve(list[getUrl()] = JSON.parse(body));
                    }
                }
            );
        }

        var list : {[name : string] : any[] } = { };

        export function makeSureList() : Promise<any[]>
        {
            return new Promise<any[]>
            (
                async (resolve) =>
                {
                    var key = getUrl();
                    if (!list[key])
                    {
                        await getList();
                    }
                    resolve(list[key]);
                }
            );
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
            var simplifyPostData = getConfiguration<boolean>("simplifyPostData");
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
                json['codes'] = additionals.map
                (
                    filename => pass_through =
                    {
                        'file': filename,
                        'code': vscode.workspace.textDocuments
                            .find(document => filename === document.fileName)
                            .getText()
                    }
                );
            }
            if (json['stdin'])
            {
                json['stdin'] = vscode.workspace.textDocuments
                            .find(document => json['stdin'] === document.fileName)
                            .getText();
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
            let { error, response, body } = await rx.execute
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
            if (response.statusCode)
            {
                OutputChannel.appendLine(`HTTP statusCode: ${response.statusCode}`);
            }
            if (!error && response.statusCode === 200)
            {
                if (body.status)
                {
                    OutputChannel.appendLine(`status: ${body.status}`);
                }
                if (body.signal)
                {
                    OutputChannel.appendLine(`${emoji("signal")}signal: ${body.signal}`);
                }
                if (body.compiler_output)
                {
                    OutputChannel.appendLine('compiler_output: ');
                    OutputChannel.appendLine(body.compiler_output);
                }
                if (body.compiler_error)
                {
                    OutputChannel.appendLine(`${emoji("error")}compiler_error: `);
                    OutputChannel.appendLine(body.compiler_error);
                }
                //body.compiler_message
                //merged messages compiler_output and compiler_error
                if (body.program_output)
                {
                    OutputChannel.appendLine('program_output: ');
                    OutputChannel.appendLine(body.program_output);
                }
                if (body.program_error)
                {
                    OutputChannel.appendLine(`${emoji("error")}program_error: `);
                    OutputChannel.appendLine(body.program_error);
                }
                //body.program_message
                //merged messages program_output and program_error
                //body.permlink && outputChannel.appendLine(`${emoji("link")}permlink: ${body.permlink}`);
                if (body.url)
                {
                    OutputChannel.appendLine(`${emoji("link")}url: ${body.url}`);
                    if (getConfiguration<boolean>("autoOpenShareUrl"))
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
                if (body)
                {
                    OutputChannel.appendLine(body);
                }
                if (error)
                {
                    OutputChannel.appendLine(`${emoji("error")}error: ${error}`);
                }
            }
            OutputChannel.appendLine(`${emoji("lap")}time: ${(endAt.getTime() -startAt.getTime()) /1000} s`);
        }
    }

    module WorkSpace
    {
        export function IsOpenFiles(files : string[]) : boolean
        {
            var notFoundFiles = files.filter
            (
                file => !vscode.workspace.textDocuments.find(document => file === document.fileName)
            );
            notFoundFiles.forEach
            (
                file => OutputChannel.appendLine
                (
                    `${emoji("error")}Not found file: ${file} ( If opened, show this file once. And keep to open it.)`
                )
            );
            return notFoundFiles.length <= 0;
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

        export function getTextFiles() : string[]
        {
            return vscode.workspace.textDocuments
                    .filter
                    (
                        i =>
                            0 === i.fileName.indexOf("Untitled") ||
                            0 <= i.fileName.indexOf("/") ||
                            0 <= i.fileName.indexOf("\\")
                    )
                    .map(i => i.fileName)
                    .filter((value, i, self) => self.indexOf(value) === i);
        }

        export async function showJson(titile : string, json : any) : Promise<void>
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
            vscode.window.showTextDocument
            (
                await vscode.workspace.openTextDocument
                (
                    vscode.Uri.parse(`wandbox-vscode-json://wandbox-vscode/${stamp}/${titile}.json`)
                )
            );
            provider.dispose();
        }
    }

    async function getLanguageNameFromSetting(vscodeLang? :string, fileName? :string) : Promise<string>
    {
        var result : string;
        if (!result && fileName && fileSetting[fileName])
        {
            result = fileSetting[fileName].language;
        }
        if (!result && vscodeLang)
        {
            result = getConfiguration("languageMapping")[vscodeLang];
        }
        if (!result && fileName)
        {
            result = getConfiguration("extensionLanguageMapping")[fileName.split('.').reverse()[0]];
        }
        if (result)
        {
            if (!(await WandboxServer.makeSureList()).find(i => i.language === result))
            {
                //  構造上、ここでメッセージを出すと複数回同じメッセージが出てしまう。
                //OutputChannel.appendLine(`${emoji("warning")}Unknown language! : ${result}`);
                result = null;
            }
        }
        return result;
    }

    async function getLanguageList(selectedLanguage? :string) : Promise<vscode.QuickPickItem[]>
    {
        return ((await WandboxServer.makeSureList()) || [])
            .map(i => i.language)
            .filter((value, i, self) => self.indexOf(value) === i)
            .sort()
            .map
            (
                i => pass_through =
                {
                    label: emoji(selectedLanguage === i ? "checkedRadio": "uncheckedRadio") +i,
                    "description": null,
                    "detail": null,
                    "value": i
                }
            );
    }

    async function queryLanguageNameToUser(vscodeLang? :string, fileName? :string) : Promise<string>
    {
        var result : string;
        let selectedLanguage = await getLanguageNameFromSetting(vscodeLang, fileName);
        let select : any = await vscode.window.showQuickPick
        (
            getLanguageList(selectedLanguage),
            {
                placeHolder: "Select a language",
            }
        );
        if (select)
        {
            result = select.value;
            if (fileName)
            {
                fileSetting[fileName] = fileSetting[fileName] || {};
                fileSetting[fileName].language = result;
            }
        }
        return result;
    }

    async function getLanguageName(vscodeLang? :string, fileName? :string) : Promise<string>
    {
        return await getLanguageNameFromSetting(vscodeLang, fileName) ||
            await queryLanguageNameToUser(vscodeLang, fileName);
    }

    async function getWandboxCompilerName(vscodeLang :string, fileName :string) : Promise<string>
    {
        var result : string;
        let list = await WandboxServer.makeSureList();
        var setting = fileSetting[fileName];
        if (setting)
        {
            result = setting.compiler;
        }
        if (!result && fileName)
        {
            result = getConfiguration("extensionCompilerMapping")[fileName.split('.').reverse()[0]];
        }
        if (result)
        {
            if (!list.find(i => i.name === result))
            {
                OutputChannel.appendLine(`${emoji("error")}Unknown compiler! : ${result}`);
                result = null;
            }
        }
        if (!result)
        {
            let language = await getLanguageName(vscodeLang, fileName);
            if (language)
            {
                result = getConfiguration("languageCompilerMapping")[language] ||
                    list.find(i => i.language === language).name;
            }
        }
        return result;
    }

    async function getOptions(vscodeLang :string, fileName :string) : Promise<string>
    {
        var result : string;
        var setting = fileSetting[fileName];
        if (setting)
        {
            result = setting.options;
        }
        if (!result)
        {
            var compilerName = await getWandboxCompilerName(vscodeLang, fileName);
            if (compilerName)
            {
                result = getConfiguration("options")[compilerName];
            }
            if (!result)
            {
                result =
                (
                    (await WandboxServer.makeSureList())
                    .find(i => i.name === compilerName).switches || []
                )
                .map
                (
                    item =>
                        item.options ? item.default:
                        item.default ? item.name:
                        null
                )
                .filter(i => i)
                .join(",");
            }
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
    
    async function showWandboxListJson() : Promise<void>
    {
        WorkSpace.showJson
        (
            "list",
            await WandboxServer.getList()
        );
    }
    
    async function setSetting(name : string,　dialog : () => Promise<string>) : Promise<void>
    {
        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            var fileName = document.fileName;
            let value = await dialog();
            if (undefined !== value)
            {
                fileSetting[fileName] = fileSetting[fileName] || {};
                if (value)
                {
                    if ('codes' === name)
                    {
                        if (!newDocument.additionalTo)
                        {
                            var newFiles = JSON.parse(value);
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
                            OutputChannel.appendLine(`${emoji("error")}${Err}`);
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
                            OutputChannel.appendLine(`${emoji("error")}${Err}`);
                        }
                    }
                }
                else
                {
                    fileSetting[fileName][name] = null;
                    OutputChannel.appendLine(`Reset ${name} for "${fileName}"`);
                }
            }
            else
            {
                OutputChannel.canceled();
            }
        }
        else
        {
            OutputChannel.appendLine(`${emoji("error")}No active text editor!`);
        }
    }
    async function setSettingByInputBox(name : string,　prompt : string) : Promise<void>
    {
        return setSetting
        (
            name,
            async () => await vscode.window.showInputBox({ prompt }) 
        );
    }

    async function setServerSetting() : Promise<void>
    {
        await setSetting
        (
            'server',
            async function () : Promise<string>
            {
                var result : string;
                var selectedServer = WandboxServer.getServer();
                var servers = getConfiguration<string[]>("Servers");
                var list : any[] = servers.map
                (
                    i => pass_through =
                    {
                        label: emoji(selectedServer === i ? "checkedRadio": "uncheckedRadio") +i,
                        "description": null,
                        "detail": null,
                        "value": i
                    }
                );
                list[0].description = "default";
                let isOther = servers.indexOf(selectedServer) < 0;
                list.push
                (
                    {
                        label: emoji(isOther ? "checkedRadio": "uncheckedRadio") +"Other",
                        "description": "enter a server url by manual",
                        "detail": isOther ? selectedServer: null
                    }
                );
                var select = await vscode.window.showQuickPick
                (
                    list,
                    {
                        placeHolder: "Select a server",
                    }
                );
                if (select)
                {
                    if (select === list.reverse()[0])
                    {
                        result = await vscode.window.showInputBox({prompt : 'Enter a server url'});
                    }
                    else
                    {
                        result = select.value;
                    }
                }
                return result;
            }
        );
    }

    async function getCompilerList(language : string) : Promise<vscode.QuickPickItem[]>
    {
        return ((await WandboxServer.makeSureList()) || [])
            .filter(i => i.language === language)
            .map
            (
                i => pass_through =
                {
                    "label": i["display-name"] +" " +i["version"],
                    "description": i["name"],
                    "detail": null
                }
            );
    }

    async function setCompilerSetting() : Promise<void>
    {
        await setSetting
        (
            'compiler',
            async function () : Promise<string>
            {
                var result : string;
                var document = WorkSpace.getActiveDocument();
                var vscodeLang = document.languageId;
                var fileName = document.fileName;
                var language = await queryLanguageNameToUser(vscodeLang, fileName);
                if (language)
                {
                    let compilerList = await getCompilerList(language);
                    if (1 === compilerList.length)
                    {
                        result = compilerList[0].description;
                    }
                    else
                    {
                        let selectedCompiler = await getWandboxCompilerName(vscodeLang, fileName);
                        if (!selectedCompiler || !compilerList.find(i => selectedCompiler === i.description))
                        {
                            selectedCompiler = compilerList[0].description;
                        }
                        for(let i of compilerList)
                        {
                            i.label = emoji(selectedCompiler === i.description ? "checkedRadio": "uncheckedRadio") +i.label;
                        }
                        let select = await vscode.window.showQuickPick
                        (
                            compilerList,
                            {
                                placeHolder: "Select a compiler",
                            }
                        );
                        if (select)
                        {
                            result = select.description;
                        }
                    }
                }
                return result;
            }
        );
    }

    async function setAdditionalsSetting()
    {
        await setSetting
        (
            'codes',
            async function () : Promise<string>
            {
                var document = WorkSpace.getActiveDocument();
                var setting = fileSetting[document.fileName] || {};
                var additionals = setting['codes'] || [];
                var result : string = JSON.stringify(additionals);
                let workspaceTextFiles = WorkSpace.getTextFiles();
                let select = await vscode.window.showQuickPick
                (
                    [].concat
                    (
                        workspaceTextFiles
                            .map
                            (
                                fileName => pass_through =
                                {
                                    label: emoji(0 <= additionals.indexOf(fileName) ? "checkedBox": "uncheckedBox") +stripDirectory(fileName),
                                    description: fileName,
                                    detail: document.fileName === fileName ? "this file itself": null
                                }
                            ),
                        additionals
                            .filter(fileName => !workspaceTextFiles.find(i => i === fileName))
                            .map
                            (
                                fileName => pass_through =
                                {
                                    label: emoji("checkedBox") +stripDirectory(fileName),
                                    description: fileName,
                                    detail: `${emoji("error")}Not found file ( If opened, show this file once. And keep to open it.)`
                                }
                            ),
                        {
                            label: `${emoji("new")}new untitled document`,
                            description: null,
                            detail: null
                        }
                    ),
                    {
                        placeHolder: "Select a add file( or a remove file )",
                    }
                );
                if (select)
                {
                    if (select.description)
                    {
                        if (0 <= additionals.indexOf(select.description))
                        {
                            additionals = additionals.filter(value => select.description !== value);
                        }
                        else
                        {
                            additionals.push(select.description);
                        }
                    }
                    else
                    {
                        newDocument.additionalTo = document.fileName;
                        await vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
                    }
                    result = JSON.stringify(additionals);
                }
                return result;
            }
        );
    }

    async function setStdInSetting()
    {
        await setSetting
        (
            'stdin',
            async function () : Promise<string>
            {
                var document = WorkSpace.getActiveDocument();
                var setting = fileSetting[document.fileName] || {};
                var stdin : string = setting['stdin'];
                let fileList : vscode.QuickPickItem[] = [];
                let noStdIn : vscode.QuickPickItem = 
                {
                    label: emoji(!stdin ? "checkedRadio": "uncheckedRadio") +"no stdin",
                    description: null,
                    detail: null
                };
                fileList.push(noStdIn);
                WorkSpace.getTextFiles()
                    .forEach
                    (
                        fileName => fileList.push
                        (
                            {
                                label: emoji(stdin === fileName ? "checkedRadio": "uncheckedRadio") +stripDirectory(fileName),
                                description: fileName,
                                detail: document.fileName === fileName ? "this file itself": null
                            }
                        )
                    );
                if (stdin && !fileList.find(item => stdin === item.description))
                {
                    fileList.push
                    (
                        {
                            label: emoji("checkedRadio") +stripDirectory(stdin),
                            description: stdin,
                            detail: `${emoji("error")}Not found file ( If opened, show this file once. And keep to open it.)`
                        }
                    );
                }
                let newUntitledDocument : vscode.QuickPickItem = 
                {
                    label: `${emoji("new")}new untitled document`,
                    description: null,
                    detail: null
                };
                fileList.push(newUntitledDocument);
                let select = await vscode.window.showQuickPick
                (
                    fileList,
                    {
                        placeHolder: "Select a file as a stdin",
                    }
                );
                var result : string = undefined;
                if (select)
                {
                    if (newUntitledDocument !== select)
                    {
                        if (noStdIn === select)
                        {
                            result = null;
                        }
                        else
                        {
                            result = select.description
                                .replace("\\","\\\\")
                                .replace("\"","\\\"");
                        }
                    }
                    else
                    {
                        newDocument.stdinTo = document.fileName;
                        await vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
                    }
                }
                return result;
            }
        );
    }

    async function setOptionsSetting() : Promise<void>
    {
        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            let languageId = document.languageId;
            let fileName = document.fileName;
            var compilerName = await getWandboxCompilerName
            (
                languageId,
                fileName
            );
            if (compilerName)
            {
                var compiler = (<any[]> await WandboxServer.makeSureList())
                    .find(i => i.name === compilerName);
                var options : string = await getOptions
                (
                    languageId,
                    fileName
                );
                var setting = fileSetting[fileName];
                if (setting && undefined !== setting['options'])
                {
                    options = setting['options'];
                }
                var selectedOptionList = (options || "").split(",").filter(i => i);

                let optionList : any[] = [];
                let separator =
                {
                    label: "",
                    description: emoji("menuSeparator")
                };
                let AdditinalsMenuItem =
                {
                    label: `${emoji("edit")}Select a add file( or a remove file )`,
                    description: "",
                    detail: setting && (setting['codes'] || []).join(', '),
                };
                optionList.push(AdditinalsMenuItem);
                let stdInMenuItem =
                {
                    label: `${emoji("edit")}Select a file as a stdin`,
                    description: "",
                    detail: setting && setting['stdin'],
                };
                optionList.push(stdInMenuItem);
                let CompilerOptionRawMenuItem =
                {
                    label: `${emoji("edit")}Set compiler option raw`,
                    description: "",
                    detail: setting && setting['compiler-option-raw'],
                };
                if (compiler['compiler-option-raw'])
                {
                    optionList.push(CompilerOptionRawMenuItem);
                }
                let RuntimeOptionRawMenuItem =
                {
                    label: `${emoji("edit")}Set runtime option raw`,
                    description: "",
                    detail: setting && setting['runtime-option-raw'],
                };
                if (compiler['runtime-option-raw'])
                {
                    optionList.push(RuntimeOptionRawMenuItem);
                }
                let lastGroup = 0;
                for(let item of (compiler.switches || []))
                {
                    if (item.options)
                    {
                        optionList.push(separator);
                        for(let option of item.options)
                        {
                            optionList.push
                            (
                                {
                                    label: emoji(0 <= selectedOptionList.indexOf(option.name) ? "checkedRadio": "uncheckedRadio") +option["display-name"],
                                    description: option["display-flags"],
                                    detail:  null,
                                    item,
                                    option
                                }
                            );
                        }
                        lastGroup = 2;
                    }
                    else
                    {
                        if (1 !== lastGroup)
                        {
                            optionList.push(separator);
                        }
                        optionList.push
                        (
                            {
                                label: emoji(0 <= selectedOptionList.indexOf(item.name) ? "checkedBox": "uncheckedBox") +item["display-name"],
                                description: item["display-flags"],
                                detail:  null,
                                item
                            }
                        );
                        lastGroup = 1;
                    }
                }

                let select = await vscode.window.showQuickPick
                (
                    optionList,
                    {
                        placeHolder: "Select a add option( or a remove option )",
                    }
                );
                if (select)
                {
                    if (AdditinalsMenuItem === select)
                    {
                        setAdditionalsSetting();
                    }
                    else
                    if (stdInMenuItem === select)
                    {
                        setStdInSetting();
                    }
                    else
                    if (CompilerOptionRawMenuItem === select)
                    {
                        setRawOptionSetting('compiler-option-raw', 'Enter compiler option raw');
                    }
                    else
                    if (RuntimeOptionRawMenuItem === select)
                    {
                        setRawOptionSetting('runtime-option-raw', 'Enter runtime option raw');
                    }
                    else
                    if (select.item)
                    {
                        if (select.option)
                        {
                            for(let option of select.item.options)
                            {
                                selectedOptionList = selectedOptionList.filter(i => i !== option.name);
                            }
                            selectedOptionList.push(select.option.name);
                        }
                        else
                        {
                            let selected = 0 <= selectedOptionList.indexOf(select.item.name);
                            if (selected)
                            {
                                selectedOptionList = selectedOptionList.filter(i => i !== select.item.name);
                            }
                            else
                            {
                                selectedOptionList.push(select.item.name);
                            }
                        }

                        try
                        {
                            setting = fileSetting[fileName] = fileSetting[fileName] || {};
                            setting['options'] = selectedOptionList.join(",");
                            OutputChannel.appendLine(`Set options "${setting['options']}" for "${fileName}"`);
                        }
                        catch(Err)
                        {
                            OutputChannel.appendLine(`${emoji("error")}${Err}`);
                        }
                    }
                }
            }
        }
    }

    async function setRawOptionSetting(name : string,　prompt : string) : Promise<void>
    {
        return setSetting
        (
            name,
            async () : Promise<string> =>
            {
                var result : string;
                var document = WorkSpace.getActiveDocument();
                if (null !== document)
                {
                    let languageId = document.languageId;
                    let fileName = document.fileName;
                    var compilerName = await getWandboxCompilerName
                    (
                        languageId,
                        fileName
                    );
                    if (compilerName)
                    {
                        var compiler = (<any[]> await WandboxServer.makeSureList())
                            .find(i => i.name === compilerName);
                        if (compiler && compiler[name])
                        {
                            result = await vscode.window.showInputBox({ prompt });
                        }
                        else
                        {
                            OutputChannel.appendLine(`${emoji("warning")}This compiler not accept "${name}".`);
                        }
                    }
                }
                return result;
            }
        );
    }

    function resetWandboxFileSettings() : void
    {
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
                OutputChannel.appendLine(`${emoji("warning")}Not found settings for "${fileName}"`);
            }
        }
        else
        {
            OutputChannel.appendLine(`${emoji("error")}No active text editor!`);
        }
    }
    
    async function invokeWandbox(args ?: any) : Promise<void>
    {
        var document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            var compilerName = await getWandboxCompilerName
            (
                document.languageId,
                document.fileName
            );
            if (compilerName)
            {
                var additionals : string[];
                var options : string = await getOptions
                (
                    document.languageId,
                    document.fileName
                );
                var stdIn : string;
                var compilerOptionRaw : string = getConfiguration("compilerOptionRaw")[compilerName];
                var runtimeOptionRaw : string = getConfiguration("runtimeOptionRaw")[compilerName];
                var setting = fileSetting[document.fileName];
                if (setting)
                {
                    additionals = setting['codes'];
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
                    if (!WorkSpace.IsOpenFiles([stdIn]))
                    {
                        return;
                    }
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
                OutputChannel.canceled();
            }
        }
        else
        {
            OutputChannel.appendLine(`${emoji("error")}No active text editor!`);
        }
    }
    
    var newDocument =
    {
        text: null,
        sourceFile: null,
        additionalTo: null,
        stdinTo: null
    };

    async function getHelloWorldFiles() : Promise<vscode.QuickPickItem[]>
    {
        var extensionPath = vscode.extensions.getExtension("wraith13.wandbox-vscode").extensionPath;
        var userFiles = getConfiguration<string[]>("helloWolrdFiles");
        var fileExtensionQuickPickList : vscode.QuickPickItem[] = [];
        let { error, files } = await fx.readdir(`${extensionPath}/hellos`);
        if (error)
        {
            OutputChannel.appendLine(emoji("error") +error.message);
        }
        else
        {
            const hello = "hello.";
            for(let i of userFiles)
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
            for(let i of files)
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
        }
        return fileExtensionQuickPickList;
    }

    async function helloWandbox() : Promise<void>
    {
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
            var helloFilePath = select.description;
            OutputChannel.appendLine(`${emoji("new")}Open a [hello, world!] as a new file. ( Source is "${helloFilePath}" )`);
            if (await fx.exists(helloFilePath))
            {
                let { err, data } = await fx.readFile(helloFilePath);
                if (err)
                {
                    OutputChannel.appendLine(emoji("error") +err.message);
                }
                else
                {
                    newDocument.text = data.toString();
                    newDocument.sourceFile = helloFilePath;

                    //  ドキュメント上は vscode.workspace.openTextDocument() で language を指定して新規ファイルオープン
                    //  できることになってるっぽいんだけど、実際にそういうことができないので代わりに workbench.action.files.newUntitledFile
                    //  を使っている。 untitled: を使ったやり方は保存予定の実パスを指定する必要があり、ここの目的には沿わない。

                    //  language を指定して新規ファイルオープンできるようになったらその方法での実装に切り替えることを検討すること。

                    await vscode.commands.executeCommand("workbench.action.files.newUntitledFile");
                    //  ここでは新規オープンされた document 周りの情報がなにも取得できないのでなにもできない。
                    //  なので　vscode.window.onDidChangeActiveTextEditor　で処理している。
                }
            }
            else
            {
                OutputChannel.appendLine(`${emoji("error")} Unknown file extension!`);
                OutputChannel.appendLine(`${emoji("hint")}You can set hello world files by [wandbox.helloWolrdFiles] setting.`);
            }
        }
        else
        {
            OutputChannel.canceled();
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
                command: 'extension.showWandboxListJson',
                callback: showWandboxListJson
            },
            {
                command: 'extension.setWandboxFileServer',
                callback: setServerSetting
            },
            {
                command: 'extension.setWandboxFileCompiler',
                callback: setCompilerSetting
            },
            {
                command: 'extension.setWandboxFileOptions',
                callback: setOptionsSetting
            },
            {
                command: 'extension.setWandboxFileSettingJson',
                callback: () => setSettingByInputBox(null, 'Enter settings JSON')
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
            i => context.subscriptions.push
            (
                vscode.commands.registerCommand
                (
                    i.command,
                    () =>
                    {
                        OutputChannel.makeSure();
                        OutputChannel.bowWow();
                        i.callback();
                    }
                )
            )
        );

        /*
        workbench.action.files.newUntitledFile を呼び出した際になぜか閉じられてもなければ untiled でもないドキュメント
        が untiled な扱いで閉じたとされて呼び出されてしまう。 vscode v1.9.1 のバグではないかと思われる。仕方が無いので 
        vscode.window.onDidChangeActiveTextEditor 内で代わりに処理するように修正した。
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
        */

        vscode.window.onDidChangeActiveTextEditor
        (
            async (textEditor : vscode.TextEditor) : Promise<void> =>
            {
                if (textEditor)
                {
                    var document = textEditor.document;
                    if (document && document.isUntitled)
                    {
                        if (fileSetting[document.fileName])
                        {
                            delete fileSetting[document.fileName];
                        }
                        if (newDocument.text)
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
                            var fileName = document.fileName;
                            var compiler = await getWandboxCompilerName(undefined, newDocument.sourceFile);
                            if (compiler)
                            {
                                fileSetting[fileName] = fileSetting[fileName] || {};
                                fileSetting[fileName]['compiler'] = compiler;
                            }

                            newDocument.text = null;
                            newDocument.sourceFile = null;
                        }
                        if (newDocument.additionalTo)
                        {
                            let fileName = newDocument.additionalTo;
                            fileSetting[fileName] = fileSetting[fileName] || {};
                            let newFiles = fileSetting[fileName]['codes'] || [];
                            newFiles.push(document.fileName);
                            fileSetting[fileName]['codes'] = newFiles;
                            OutputChannel.appendLine(`Set codes "${newFiles.join('","')}" for "${fileName}"`);
                            newDocument.additionalTo = null;
                        }
                        if (newDocument.stdinTo)
                        {
                            let fileName = newDocument.stdinTo;
                            fileSetting[fileName] = fileSetting[fileName] || {};
                            fileSetting[fileName]['stdin'] = document.fileName;
                            OutputChannel.appendLine(`Set stdin "${document.fileName}" for "${fileName}"`);
                            newDocument.stdinTo = null;
                        }
                    }
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
