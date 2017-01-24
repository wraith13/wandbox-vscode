'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext)
{

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
    }
    var bowWow = () =>
    {
        outputChannel.show();
        outputChannel.appendLine('Bow-wow! ' + new Date().toString());
    }

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

                outputChannel.appendLine('HTTP GET http://melpon.org/wandbox/api/list.json?from=wandbox-vscode');
                request.get
                (
                    'http://melpon.org/wandbox/api/list.json',
                    function (error, response, body)
                    {
                        if (!error && response.statusCode == 200)
                        {
                            var list = JSON.parse(body);
                            list && list.forEach
                            (
                                item => outputChannel.appendLine(item.name +'\t' +item.language)
                            );
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

                outputChannel.appendLine('HTTP GET http://melpon.org/wandbox/api/list.json?from=wandbox-vscode');
                request.get
                (
                    'http://melpon.org/wandbox/api/list.json',
                    function (error, response, body)
                    {
                        if (!error && response.statusCode == 200)
                        {
                            var provider = vscode.workspace.registerTextDocumentContentProvider
                            (
                                'wandbox-list-json',
                                new class implements vscode.TextDocumentContentProvider
                                {
                                    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken)
                                        : string | Thenable<string>
                                    {
                                        return JSON.stringify(JSON.parse(body), null, 4);
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
                    outputChannel.appendLine('fileName: ' +activeTextEditor.document.fileName);
                    outputChannel.appendLine('text: ' +activeTextEditor.document.getText());
                    outputChannel.appendLine('languageId: ' +activeTextEditor.document.languageId);
                }
            }
        )
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}