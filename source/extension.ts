'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as https from 'https';
import { IncomingMessage } from 'http';
import * as fs from 'fs';

module rx
{
    export const get = (url: string): Thenable<{ error: any, response: IncomingMessage, body: string }> => new Promise
    (
        resolve => https.get
        (
            url,
            response =>
            {
                let body = "";
                response.setEncoding("UTF-8");
                response.on("data", chunk => body += chunk);
                response.on("end", () => resolve({ error:undefined, response, body}));
            }
        )
    );
    export const execute = (options : https.RequestOptions, data?: string | Buffer | Uint8Array)
        : Thenable<{ error : any, response : IncomingMessage, body : string}> => new Promise
    (
        resolve =>
        {
            const request = https.request
            (
                options,
                response =>
                {
                    let body = "";
                    response.setEncoding("UTF-8");
                    response.on("data", chunk => body += chunk);
                    response.on("end", () => resolve({ error:undefined, response, body}));
                }
            );
            if (data)
            {
                request.write(data);
            }
            request.end();
        }
    );
}

module fx
{
    export const readdir = (path : string)
        : Thenable<{ error : NodeJS.ErrnoException, files : string[] }> => new Promise
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

    export const exists = (path : string) : Thenable<boolean> => new Promise
    (
        resolve => fs.exists
        (
            path,
            exists => resolve(exists)
        )
    );

    export const readFile = (path : string)
        : Thenable<{ err : NodeJS.ErrnoException, data : Buffer }> =>new Promise
    (
        resolve => fs.readFile
        (
            path,
            (err : NodeJS.ErrnoException, data : Buffer) => resolve({ err, data })
        )
    );
}

module WandboxVSCode
{
    const extentionName = "wandbox-vscode";
    let context: vscode.ExtensionContext;
    const fileSetting = { };

    const stripDirectory = (path : string) : string =>path
            .split('\\').reverse()[0]
            .split('/').reverse()[0];

    const getConfiguration = <type>(key ?: string) : type =>
    {
        const configuration = vscode.workspace.getConfiguration("wandbox");
        return key ?
            configuration[key]:
            configuration;
    };
    const openNewTextDocument = async (language : string) : Promise<vscode.TextDocument> =>
        await vscode.workspace.openTextDocument({ language });

    const openNewCodeDocument = async (language : string, compiler : string, code : string) : Promise<void> =>
    {
        const languageMapping = getConfiguration("languageMapping");
        const vscodeLang =
        (
            Object
                .keys(languageMapping)
                .map
                (
                    vscodeLang =>
                    ({
                        vscodeLang,
                        language:languageMapping[vscodeLang]
                    })
                )
                .find(i => i.language === language) ||
            { vscodeLang:null }
        )
        .vscodeLang || "";
        console.log("vscodeLang:" +vscodeLang);
        const document = await openNewTextDocument(vscodeLang);
        const textEditor = await vscode.window.showTextDocument(document);
        textEditor.edit
        (
            (editBuilder: vscode.TextEditorEdit) =>
            {
                editBuilder.insert(new vscode.Position(0,0), code);
            }
        );
        const fileName = document.fileName;
        if (compiler)
        {
            fileSetting[fileName] = fileSetting[fileName] || {};
            fileSetting[fileName]['compiler'] = compiler;
        }
    };

    class HistoryEntry
    {
        public timestamp : Date;
        public language : string;
        public compiler : string;
        public shareUrl : string;
    }

    const getHistory = async () : Promise<HistoryEntry[]> =>
        await context.globalState.get<HistoryEntry[]>("history", []);
    const updateHistory = async (history : HistoryEntry[]) : Promise<void> =>
        await context.globalState.update("history", history);

    const emoji = (key : string) : string =>
    {
        let result : string = getConfiguration("emoji")[key];
        if (result)
        {
            result += " ";
        }
        else
        {
            result = "";
        }
        return result;
    };

    module OutputChannel
    {
        let outputChannel :vscode.OutputChannel;

        export const makeSure = () :vscode.OutputChannel =>
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
        };

        export const bowWow = () : void =>
        {
            show();
            appendLine(`${emoji("stamp")}Bow-wow! ${new Date().toString()}`);
        };

        export const show = () : void =>
            outputChannel.show(true);
        export const appendLine = (value : string) : void =>
            outputChannel.appendLine(value);

        export const appendJson = (value : any) : void =>
            OutputChannel.appendLine(JSON.stringify(value, null, 4));

        export const canceled = () : void =>
            appendLine(`Canceled`);
    }

    module WandboxServer
    {
        export const getServer = () : string =>
        {
            let result : string;
            const setting = fileSetting[WorkSpace.getCurrentFilename()];
            if (setting)
            {
                result = setting.server;
            }
            if (!result)
            {
                result = getConfiguration<string[]>("Servers")[0];
            }
            return result;
        };

        const getUrl = () :string =>
        {
            let result : string = getServer();
            if (result.endsWith("/"))
            {
                result = result.substr(0, result.length -1);
            }
            return result;
        };

        export const getWebUrl = () :string =>
            getUrl() +`/?from=${extentionName}`;

        export const getList = async () : Promise<any[]> => new Promise<any[]>
        (
            async (resolve, reject) =>
            {
                const requestUrl = getUrl() +`/api/list.json?from=${extentionName}`;
                OutputChannel.appendLine(`HTTP GET ${requestUrl}`);
                const { error, response, body } = await rx.get
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

        const list : {[name : string] : any[] } = { };

        export const makeSureList = () : Promise<any[]> => new Promise<any[]>
        (
            async (resolve) =>
            {
                const key = getUrl();
                if (!list[key])
                {
                    await getList();
                }
                resolve(list[key]);
            }
        );

        export const getTemplate = async (templateName : string) : Promise<any[]> => new Promise<any[]>
        (
            async (resolve, reject) =>
            {
                const requestUrl = getUrl() +`/api/template/${templateName}`;
                OutputChannel.appendLine(`HTTP GET ${requestUrl}`);
                const { error, response, body } = await rx.get
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
                    resolve(templates[templateName] = JSON.parse(body));
                }
            }
        );

        const templates : {[name : string] : any[] } = { };

        export const makeSureTempate = (templateName : string) : Promise<any[]> => new Promise<any[]>
        (
            async (resolve) =>
            {
                if (!templates[templateName])
                {
                    await getTemplate(templateName);
                }
                resolve(templates[templateName]);
            }
        );

        const buildCompileJson = (json : { }) : { } =>
        {
            const document : vscode.TextDocument = json['code'];
            let additionals : string[];
            const setting = fileSetting[document.fileName];
            if (setting)
            {
                additionals = setting['codes'];
            }
            const simplifyPostData = getConfiguration<boolean>("simplifyPostData");
            if (simplifyPostData)
            {
                //  簡素化
                json['code'] = document.fileName;
                if (additionals)
                {
                    json['codes'] = additionals.map(i => `'${i}' as '${stripDirectory(i)}'`).join(',');
                }

                OutputChannel.appendJson(json);
            }
            if (additionals)
            {
                json['codes'] = additionals.map
                (
                    filename =>
                    ({
                        'file': stripDirectory(filename),
                        'code': vscode.workspace.textDocuments
                            .find(document => filename === document.fileName)
                            .getText()
                    })
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
        };

        const appendHistory = async (compiler : string, shareUrl : string) : Promise<void> =>
        {
            const history = await getHistory();
            const maxHistorySize = Math.max(0, getConfiguration<number>("maxHistorySize"));
            if (maxHistorySize || history.length)
            {
                history.push
                (
                    {
                        timestamp: new Date(),
                        language: (await makeSureList()).find(i => i.name === compiler).language,
                        compiler,
                        shareUrl,
                    }
                );
                while(maxHistorySize < history.length)
                {
                    history.shift();
                }
                await updateHistory(history);
            }
        };

        export const compile = async (json : { }) : Promise<void> =>
        {
            const requestUrl = getUrl() +`/api/compile.json`;
            OutputChannel.appendLine(`HTTP POST ${requestUrl}`);

            const startAt = new Date();
            const requestArgs =vscode.Uri.parse(requestUrl);
            const { error, response, body } = await rx.execute
            (
                {
                    protocol: `${requestArgs.scheme}:`,
                    host: requestArgs.authority,
                    path: requestArgs.path,
                    // query: requestArgs.query, 🔥
                    method: 'POST',
                    headers:
                    {
                        //'Content-Type': 'application/json',
                        'User-Agent': extentionName
                    },
                },
                JSON.stringify(buildCompileJson(json))
            );
            const endAt = new Date();
            if (response.statusCode)
            {
                OutputChannel.appendLine(`HTTP statusCode: ${response.statusCode}`);
            }
            if (!error && response.statusCode === 200)
            {
                const result = JSON.parse(body);
                if (result.status)
                {
                    OutputChannel.appendLine(`status: ${result.status}`);
                }
                if (result.signal)
                {
                    OutputChannel.appendLine(`${emoji("signal")}signal: ${result.signal}`);
                }
                if (result.compiler_output)
                {
                    OutputChannel.appendLine('compiler_output: ');
                    OutputChannel.appendLine(result.compiler_output);
                }
                if (result.compiler_error)
                {
                    OutputChannel.appendLine(`${emoji("error")}compiler_error: `);
                    OutputChannel.appendLine(result.compiler_error);
                }
                //result.compiler_message
                //merged messages compiler_output and compiler_error
                if (result.program_output)
                {
                    OutputChannel.appendLine('program_output: ');
                    OutputChannel.appendLine(result.program_output);
                }
                if (result.program_error)
                {
                    OutputChannel.appendLine(`${emoji("error")}program_error: `);
                    OutputChannel.appendLine(result.program_error);
                }
                //result.program_message
                //merged messages program_output and program_error
                //result.permlink && outputChannel.appendLine(`${emoji("link")}permlink: ${result.permlink}`);
                if (result.url)
                {
                    OutputChannel.appendLine(`${emoji("link")}url: ${result.url}`);
                    if (getConfiguration<boolean>("autoOpenShareUrl"))
                    {
                        vscode.commands.executeCommand
                        (
                            'vscode.open',
                            vscode.Uri.parse(result.url)
                        );
                    }
                    await appendHistory(json['compiler'], result.url);
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
        };
    }

    module WorkSpace
    {
        export const IsOpenFiles = (files : string[]) : boolean =>
        {
            const notFoundFiles = files.filter
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
        };

        export const getActiveDocument = () :vscode.TextDocument =>
        {
            const activeTextEditor = vscode.window.activeTextEditor;
            if (null !== activeTextEditor && undefined !== activeTextEditor)
            {
                const document = activeTextEditor.document;
                if (null !== document && undefined !== document)
                {
                    return document;
                }
            }
            return null;
        };

        export const getCurrentFilename = () : string =>
        {
            let result : string;
            const document = getActiveDocument();
            if (null !== document)
            {
                result = document.fileName;
            }
            if (!result)
            {
                result = "wandbox-vscode:default";
            }
            return result;
        };

        export const getTextFiles = () : string[] =>
            vscode.workspace.textDocuments
                .filter
                (
                    i =>
                        0 === i.fileName.indexOf("Untitled") ||
                        0 <= i.fileName.indexOf("/") ||
                        0 <= i.fileName.indexOf("\\")
                )
                .map(i => i.fileName)
                .filter((value, i, self) => self.indexOf(value) === i);

        export const showJson = async (titile : string, json : any) : Promise<void> =>
        {
            const provider = vscode.workspace.registerTextDocumentContentProvider
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
            const date = new Date(); // 結果がキャッシュされないようにする為
            const stamp = date.getFullYear().toString()
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
        };
    }

    const getLanguageNameFromSetting = async (vscodeLang? :string, fileName? :string) : Promise<string> =>
    {
        let result : string;
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
    };

    const getLanguageList = async (selectedLanguage? :string) : Promise<vscode.QuickPickItem[]> =>
        ((await WandboxServer.makeSureList()) || [])
            .map(i => i.language)
            .filter((value, i, self) => self.indexOf(value) === i)
            .sort()
            .map
            (
                i =>
                ({
                    label: emoji(selectedLanguage === i ? "checkedRadio": "uncheckedRadio") +i,
                    "description": null,
                    "detail": null,
                    "value": i
                })
            );

    const queryLanguageNameToUser = async (vscodeLang? :string, fileName? :string) : Promise<string> =>
    {
        let result : string;
        const selectedLanguage = await getLanguageNameFromSetting(vscodeLang, fileName);
        const select : any = await vscode.window.showQuickPick
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
    };

    const getLanguageName = async (vscodeLang? :string, fileName? :string) : Promise<string> =>
        await getLanguageNameFromSetting(vscodeLang, fileName) ||
        await queryLanguageNameToUser(vscodeLang, fileName);

    const getWandboxCompilerName = async (vscodeLang :string, fileName :string) : Promise<string> =>
    {
        let result : string;
        const list = await WandboxServer.makeSureList();
        const setting = fileSetting[fileName];
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
            const language = await getLanguageName(vscodeLang, fileName);
            if (language)
            {
                result = getConfiguration("languageCompilerMapping")[language] ||
                    list.find(i => i.language === language).name;
            }
        }
        return result;
    };

    const getOptions = async (vscodeLang :string, fileName :string) : Promise<string> =>
    {
        let result : string;
        const setting = fileSetting[fileName];
        if (setting)
        {
            result = setting.options;
        }
        if (!result)
        {
            const compilerName = await getWandboxCompilerName(vscodeLang, fileName);
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
    };

    const showWandboxSettings = () : Promise<void> =>
        WorkSpace.showJson
        (
            "setting",
            {
                "basicSetting": getConfiguration(),
                "fileSetting": fileSetting
            }
        );

    const showWandboxWeb = () : Thenable<void> =>
        vscode.commands.executeCommand
        (
            'vscode.open',
            vscode.Uri.parse(WandboxServer.getWebUrl())
        );
    
    const showWandboxListJson = async () : Promise<void> =>
        WorkSpace.showJson
        (
            "list",
            await WandboxServer.getList()
        );
    
    const showHistory = async () : Promise<void> =>
    {
        const history = await getHistory();
        history.forEach(entry => OutputChannel.appendLine(`${entry.timestamp}\t${entry.shareUrl}\t${entry.language}\t${entry.compiler}\t`));
        OutputChannel.appendLine(`${history.length} share urls`);
    };

    const clearHistory = async () : Promise<void> =>
    {
        if ("Yes" === await vscode.window.showWarningMessage("Are you sure to clear share history?", "Yes"))
        {
            updateHistory([]);
            OutputChannel.appendLine(`Cleared share history.`);
        }
        else
        {
            OutputChannel.canceled();
        }
    };
    
    const setSetting = async (name : string,　dialog : () => Promise<string>) : Promise<void> =>
    {
        const document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            const fileName = document.fileName;
            const value = await dialog();
            if (undefined !== value)
            {
                fileSetting[fileName] = fileSetting[fileName] || {};
                if (value)
                {
                    if ('codes' === name)
                    {
                        const newFiles = JSON.parse(value);
                        fileSetting[fileName][name] = newFiles;
                        OutputChannel.appendLine(`Set ${name} "${newFiles.join('","')}" for "${fileName}"`);
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
    };
    const setSettingByInputBox = async (name : string,　prompt : string) : Promise<void> => setSetting
    (
        name,
        async () => await vscode.window.showInputBox({ prompt })
    );

    const setServerSetting = async () : Promise<void> => await setSetting
    (
        'server',
        async () : Promise<string> =>
        {
            let result : string;
            const selectedServer = WandboxServer.getServer();
            const servers = getConfiguration<string[]>("Servers");
            const list : any[] = servers.map
            (
                i =>
                ({
                    label: emoji(selectedServer === i ? "checkedRadio": "uncheckedRadio") +i,
                    "description": null,
                    "detail": null,
                    "value": i
                })
            );
            list[0].description = "default";
            const isOther = servers.indexOf(selectedServer) < 0;
            list.push
            (
                {
                    label: emoji(isOther ? "checkedRadio": "uncheckedRadio") +"Other",
                    "description": "enter a server url by manual",
                    "detail": isOther ? selectedServer: null
                }
            );
            const select = await vscode.window.showQuickPick
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

    const getCompilerList = async (language : string) : Promise<vscode.QuickPickItem[]> =>
        ((await WandboxServer.makeSureList()) || [])
            .filter(i => i.language === language)
            .map
            (
                i =>
                ({
                    "label": i["display-name"] +" " +i["version"],
                    "description": i["name"],
                    "detail": null
                })
            );

    const setCompilerSetting = async () : Promise<void> => await setSetting
    (
        'compiler',
        async () : Promise<string> =>
        {
            let result : string;
            const document = WorkSpace.getActiveDocument();
            const vscodeLang = document.languageId;
            const fileName = document.fileName;
            const language = await queryLanguageNameToUser(vscodeLang, fileName);
            if (language)
            {
                const compilerList = await getCompilerList(language);
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
                    for(const i of compilerList)
                    {
                        i.label = emoji(selectedCompiler === i.description ? "checkedRadio": "uncheckedRadio") +i.label;
                    }
                    const select = await vscode.window.showQuickPick
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

    const setAdditionalsSetting = async () => await setSetting
    (
        'codes',
        async () : Promise<string> =>
        {
            const document = WorkSpace.getActiveDocument();
            const setting = fileSetting[document.fileName] || {};
            let additionals = setting['codes'] || [];
            let result : string;
            const workspaceTextFiles = WorkSpace.getTextFiles();
            const select = await vscode.window.showQuickPick
            (
                [].concat
                (
                    workspaceTextFiles
                        .map
                        (
                            fileName =>
                            ({
                                label: emoji(0 <= additionals.indexOf(fileName) ? "checkedBox": "uncheckedBox") +stripDirectory(fileName),
                                description: fileName,
                                detail: document.fileName === fileName ? "this file itself": null
                            })
                        ),
                    additionals
                        .filter(fileName => !workspaceTextFiles.find(i => i === fileName))
                        .map
                        (
                            fileName =>
                            ({
                                label: emoji("checkedBox") +stripDirectory(fileName),
                                description: fileName,
                                detail: `${emoji("error")}Not found file ( If opened, show this file once. And keep to open it.)`
                            })
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
                    const newDocument = await openNewTextDocument("");
                    await vscode.window.showTextDocument(newDocument);
                    additionals.push(newDocument.fileName);
                }
                result = JSON.stringify(additionals);
            }
            return result;
        }
    );

    const setStdInSetting = async () => await setSetting
    (
        'stdin',
        async () : Promise<string> =>
        {
            const document = WorkSpace.getActiveDocument();
            const setting = fileSetting[document.fileName] || {};
            const stdin : string = setting['stdin'];
            const noStdIn : vscode.QuickPickItem = 
            {
                label: emoji(!stdin ? "checkedRadio": "uncheckedRadio") +"no stdin",
                description: null,
                detail: null
            };
            const newUntitledDocument : vscode.QuickPickItem = 
            {
                label: `${emoji("new")}new untitled document`,
                description: null,
                detail: null
            };
            const workspaceTextFiles = WorkSpace.getTextFiles();
            const select = await vscode.window.showQuickPick
            (
                [].concat
                (
                    noStdIn,
                    workspaceTextFiles.map
                    (
                        fileName =>
                        ({
                            label: emoji(stdin === fileName ? "checkedRadio": "uncheckedRadio") +stripDirectory(fileName),
                            description: fileName,
                            detail: document.fileName === fileName ? "this file itself": null
                        })
                    ),
                    (stdin && !workspaceTextFiles.find(fileName => stdin === fileName)) ?
                        {
                            label: emoji("checkedRadio") +stripDirectory(stdin),
                            description: stdin,
                            detail: `${emoji("error")}Not found file ( If opened, show this file once. And keep to open it.)`
                        }:
                        null,
                    newUntitledDocument
                )
                .filter(i => i),
                {
                    placeHolder: "Select a file as a stdin",
                }
            );
            let result : string = undefined;
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
                            .replace(/\\/g, "\\\\")
                            .replace(/\"/g, "\\\"");
                    }
                }
                else
                {
                    const newDocument = await openNewTextDocument("");
                    await vscode.window.showTextDocument(newDocument);
                    result = newDocument.fileName;
                }
            }
            return result;
        }
    );

    const setOptionsSetting = async () : Promise<void> =>
    {
        const document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            const languageId = document.languageId;
            const fileName = document.fileName;
            const compilerName = await getWandboxCompilerName
            (
                languageId,
                fileName
            );
            if (compilerName)
            {
                const compiler = (<any[]> await WandboxServer.makeSureList())
                    .find(i => i.name === compilerName);
                let options : string = await getOptions
                (
                    languageId,
                    fileName
                );
                let setting = fileSetting[fileName];
                if (setting && undefined !== setting['options'])
                {
                    options = setting['options'];
                }
                let selectedOptionList = (options || "").split(",").filter(i => i);

                const optionList : any[] = [];
                const separator =
                {
                    label: "",
                    description: emoji("menuSeparator")
                };
                const AdditinalsMenuItem =
                {
                    label: `${emoji("edit")}Select a add file( or a remove file )`,
                    description: "",
                    detail: setting && (setting['codes'] || []).join(', '),
                };
                optionList.push(AdditinalsMenuItem);
                const stdInMenuItem =
                {
                    label: `${emoji("edit")}Select a file as a stdin`,
                    description: "",
                    detail: setting && setting['stdin'],
                };
                optionList.push(stdInMenuItem);
                const CompilerOptionRawMenuItem =
                {
                    label: `${emoji("edit")}Set compiler option raw`,
                    description: "",
                    detail: setting && setting['compiler-option-raw'],
                };
                if (compiler['compiler-option-raw'])
                {
                    optionList.push(CompilerOptionRawMenuItem);
                }
                const RuntimeOptionRawMenuItem =
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
                for(const item of (compiler.switches || []))
                {
                    if (item.options)
                    {
                        optionList.push(separator);
                        for(const option of item.options)
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

                const select = await vscode.window.showQuickPick
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
                            for(const option of select.item.options)
                            {
                                selectedOptionList = selectedOptionList.filter(i => i !== option.name);
                            }
                            selectedOptionList.push(select.option.name);
                        }
                        else
                        {
                            const selected = 0 <= selectedOptionList.indexOf(select.item.name);
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
                else
                {
                    OutputChannel.canceled();
                }
            }
            else
            {
                OutputChannel.canceled();
            }
        }
    };

    const setRawOptionSetting = async (name : string,　prompt : string) : Promise<void> =>setSetting
    (
        name,
        async () : Promise<string> =>
        {
            let result : string;
            const document = WorkSpace.getActiveDocument();
            if (null !== document)
            {
                const languageId = document.languageId;
                const fileName = document.fileName;
                const compilerName = await getWandboxCompilerName
                (
                    languageId,
                    fileName
                );
                if (compilerName)
                {
                    const compiler = (<any[]> await WandboxServer.makeSureList())
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

    const resetWandboxFileSettings = () : void =>
    {
        const document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            const fileName = document.fileName;
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
    };
    
    const invokeWandbox = async (args ?: any) : Promise<void> =>
    {
        const document = WorkSpace.getActiveDocument();
        if (null !== document)
        {
            const compilerName = await getWandboxCompilerName
            (
                document.languageId,
                document.fileName
            );
            if (compilerName)
            {
                let additionals : string[];
                const options : string = await getOptions
                (
                    document.languageId,
                    document.fileName
                );
                let stdIn : string;
                let compilerOptionRaw : string = getConfiguration("compilerOptionRaw")[compilerName];
                let runtimeOptionRaw : string = getConfiguration("runtimeOptionRaw")[compilerName];
                const setting = fileSetting[document.fileName];
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

                const json =
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
    };
    
    const getHelloWorldFiles = async () : Promise<vscode.QuickPickItem[]> =>
    {
        const extensionPath = vscode.extensions.getExtension("wraith13.wandbox-vscode").extensionPath;
        const userFiles = getConfiguration<string[]>("helloWolrdFiles");
        const { error, files } = await fx.readdir(`${extensionPath}/hellos`);
        if (error)
        {
            OutputChannel.appendLine(emoji("error") +error.message);
        }
        const hello = "hello.";
        return [].concat
        (
            userFiles.map
            (
                i =>
                ({
                    "label": stripDirectory(i),
                    "description": i,
                    "detail": null
                })
            ),
            (files || [])
            .filter(i => i.startsWith(hello))
            .map
            (
                i =>
                ({
                    "label": i,
                    "description": `${extensionPath}/hellos/${i}`,
                    "detail": null
                })
            )
        );
    };

    const newWandbox = async () : Promise<void> =>
    {
        let compilerName : string;
        const language = await queryLanguageNameToUser();
        if (language)
        {
            const compilerList = await getCompilerList(language);
            if (1 === compilerList.length)
            {
                compilerName = compilerList[0].description;
            }
            else
            {
                const select = await vscode.window.showQuickPick
                (
                    compilerList,
                    {
                        placeHolder: "Select a compiler",
                    }
                );
                if (select)
                {
                    compilerName = select.description;
                }
            }
            if (compilerName)
            {
                let templateName : string;
                const compiler = (<any[]> await WandboxServer.makeSureList())
                    .find(i => i.name === compilerName);
                if (1 === compiler.templates.length)
                {
                    templateName = compiler.templates[0];
                }
                else
                {
                    const select = await vscode.window.showQuickPick
                    (
                        compiler.templates,
                        {
                            placeHolder: "Select a template",
                        }
                    );
                    if (select)
                    {
                        templateName = select;
                    }
                }
                if (templateName)
                {
                    await openNewCodeDocument
                    (
                        language,
                        compilerName,
                        (<any> await WandboxServer.makeSureTempate(templateName)).code
                    );
                }
            }
        }
    };

    const helloWandbox = async () : Promise<void> =>
    {
        const select = await vscode.window.showQuickPick
        (
            getHelloWorldFiles(),
            {
                placeHolder: "Select a [hello, world!] file",
                matchOnDescription: true
            }
        );
        if (select)
        {
            const helloFilePath = select.description;
            OutputChannel.appendLine(`${emoji("new")}Open a [hello, world!] as a new file. ( Source is "${helloFilePath}" )`);
            if (await fx.exists(helloFilePath))
            {
                const { err, data } = await fx.readFile(helloFilePath);
                if (err)
                {
                    OutputChannel.appendLine(emoji("error") +err.message);
                }
                else
                {
                    await openNewCodeDocument
                    (
                        await getLanguageName(null, helloFilePath),
                        await getWandboxCompilerName(undefined, helloFilePath),
                        data.toString()
                    );
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
    };

    export const registerCommand = (aContext: vscode.ExtensionContext) : void =>
    {
        //  oldCommand は deprecated な扱いで今後、削除予定。
        context = aContext;
        [
            {
                oldCommand: 'extension.showWandboxSettings',
                command: 'wandbox.showSettings',
                callback: showWandboxSettings
            },
            {
                oldCommand: 'extension.showWandboxWeb',
                command: 'wandbox.showWeb',
                callback: showWandboxWeb
            },
            {
                oldCommand: 'extension.showWandboxListJson',
                command: 'wandbox.showListJson',
                callback: showWandboxListJson
            },
            {
                oldCommand: 'extension.showHistory',
                command: 'wandbox.showHistory',
                callback: showHistory
            },
            {
                oldCommand: 'extension.clearHistory',
                command: 'wandbox.clearHistory',
                callback: clearHistory
            },
            {
                oldCommand: 'extension.setWandboxFileServer',
                command: 'wandbox.setFileServer',
                callback: setServerSetting
            },
            {
                oldCommand: 'extension.setWandboxFileCompiler',
                command: 'wandbox.setFileCompiler',
                callback: setCompilerSetting
            },
            {
                oldCommand: 'extension.setWandboxFileOptions',
                command: 'wandbox.setFileOptions',
                callback: setOptionsSetting
            },
            {
                oldCommand: 'extension.setWandboxFileSettingJson',
                command: 'wandbox.setFileSettingJson',
                callback: () => setSettingByInputBox(null, 'Enter settings JSON')
            },
            {
                oldCommand: 'extension.resetWandboxFileSettings',
                command: 'wandbox.resetFileSettings',
                callback: resetWandboxFileSettings
            },
            {
                oldCommand: 'extension.invokeWandbox',
                command: 'wandbox.run',
                callback: () => invokeWandbox()
            },
            {
                oldCommand: 'extension.shareWandbox',
                command: 'wandbox.share',
                callback: () => invokeWandbox({ share: true })
            },
            {
                oldCommand: null,
                command: 'wandbox.new',
                callback: newWandbox
            },
            {
                oldCommand: 'extension.helloWandbox',
                command: 'wandbox.hello',
                callback: helloWandbox
            }
        ]
        .forEach
        (
            i => context.subscriptions.concat
            (
                i.oldCommand && vscode.commands.registerCommand
                (
                    i.oldCommand,
                    () =>
                    {
                        OutputChannel.makeSure();
                        OutputChannel.bowWow();
                        i.callback();
                    }
                ),
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

        vscode.workspace.onDidCloseTextDocument
        (
            (document : vscode.TextDocument) =>
            {
                if
                (
                    // ここで見つかる場合は本当には閉じられてない
                    !vscode.workspace.textDocuments
                        .find(i => i.fileName === document.fileName) &&
                    fileSetting[document.fileName]
                )
                {
                    //OutputChannel.appendLine(`delete fileSetting[${document.fileName}]`);
                    delete fileSetting[document.fileName];
                }
            }
        );
    };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export const activate = (context: vscode.ExtensionContext) =>
    WandboxVSCode.registerCommand(context);

// this method is called when your extension is deactivated
export const deactivate = () => { };
