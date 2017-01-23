'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    var outputChannel :vscode.OutputChannel;

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "wandbox-vscode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(disposable);

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.getWandboxList', () => {
            if (!outputChannel) {
                outputChannel = vscode.window.createOutputChannel('Wandbox');
            }
            outputChannel.show();
            outputChannel.appendLine('Bow-wow!');

            request.get('http://melpon.org/wandbox/api/list.json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                outputChannel.append(body) // Show the HTML for the Google homepage. 
                outputChannel.appendLine('');
            }
            });
        })
    );
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.invokeWandbox', (args :any[]) => {
            if (!outputChannel) {
                outputChannel = vscode.window.createOutputChannel('Wandbox');
            }
            outputChannel.show();
            outputChannel.appendLine('Bow-wow!');

            args && args.forEach(arg => {
                outputChannel.appendLine('arg: ' +arg);
            });

            var activeTextEditor = vscode.window.activeTextEditor;
            if (null !== activeTextEditor)
            {
                outputChannel.appendLine('fileName: ' +activeTextEditor.document.fileName);
                outputChannel.appendLine('text: ' +activeTextEditor.document.getText());
                outputChannel.appendLine('languageId: ' +activeTextEditor.document.languageId);
            }
        })
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}