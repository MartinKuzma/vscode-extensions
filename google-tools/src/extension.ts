'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import * as fs from 'fs'; 
import * as path from 'path';
import { isUndefined } from 'util';

function createWebviewPanel (context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration();
    let googlemapsKeySetting = config.get<string>('googlemaps.key');
    if(isUndefined(googlemapsKeySetting) || googlemapsKeySetting.length === 0) {
        vscode.window.showErrorMessage("Empty API key for googlemaps.");
        return;
    }

    //const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'd3.min.js'));
    //const d3src = filePath.with({ scheme: 'vscode-resource' });

    const editor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if(isUndefined(editor)) {
        return;
    }

    if(editor.selection.isEmpty) {
        return;
    }

    var selectedText = editor.document.getText(editor.selection);

    const panel = vscode.window.createWebviewPanel(
        'googleMapsView', 
        "Maps - " + selectedText, 
        vscode.ViewColumn.Beside, 
        {enableScripts: true, retainContextWhenHidden: true, enableCommandUris: true } );
        panel.webview.html = getMapContent(selectedText, googlemapsKeySetting); // getWebviewContent(d3src.toString());
}

function getMapContent(place : string, apikey : string) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <h3>` + place +`</h3>
        <!--The div element for the map -->
        <iframe style="width:100%; min-height:500px;" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?q=`+encodeURI(place)+`&key=`+apikey+`" allowfullscreen></iframe> 
      </body>
    </html>`;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The commandId parameter must match the command field in package.json
    

    let disposable = vscode.commands.registerCommand('googletools.place', () => {
        

        // The code you place here will be executed every time your command is executed

        // var options: vscode.InputBoxOptions = {};
        // options.prompt = "Please fill.";
        // options.placeHolder = "What is this.";

        // vscode.window.showInputBox(options).then(
        //     (res) => { 
        //         vscode.window.showInformationMessage('Result of input: ' + res); 
        //         vscode.window.createWebviewPanel("type", "test", vscode.ViewColumn.Beside);
        //     });

        createWebviewPanel(context);
        // vscode.window.showInformationMessage('Hello World!');
    });
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}