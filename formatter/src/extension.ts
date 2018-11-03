'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { isUndefined } from 'util';

const whitespaceQuickPickItems :  vscode.QuickPickItem[] = [
    {
        'description': " ",
        'label': 'Space',
    },
    {
        'description': "\t",
        'label': 'Tab'
    },
    {
        'description': ',',
        'label': 'Comma'
    },
    {
        'description': ';',
        'label': 'Semicolon'
    },
    {
        'description': '|',
        'label': 'Pipe'
    }
];

function performFormatting(formatter : ((text : string) => Promise<string>)) {
    const editor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if( isUndefined(editor)) {
        return;
    }

    let text : string;
    let selection : vscode.Selection | vscode.Range;

    // Get full text
    if(editor.selection.isEmpty) {
        selection = new vscode.Range(0,0, editor.document.lineCount, 0);
        //text = editor.document.getText();
    } else {
        selection = editor.selection;
    }

    // Just get selection
    text = editor.document.getText(editor.selection);

    formatter(text).then((formattedText : string) => {
        editor.edit((editBuilder : vscode.TextEditorEdit) => {
            editBuilder.replace(selection, formattedText);
        });
    });
}

function performExtraction(inputDelimiter : string, outputDelimiter : string, columnsSelection : string) {
    const editor : vscode.TextEditor | undefined = vscode.window.activeTextEditor;
    if( isUndefined(editor)) {
        return;
    }
    
    let transformedSelection : number[] = [];

    columnsSelection.split(",").forEach((selectedColumn) => {
        let parsedIndex = Number.parseInt(selectedColumn);
        if(isNaN(parsedIndex)) {
            throw Error("Incorrect columns index: " + selectedColumn);
        }

        transformedSelection.push(Number.parseInt(selectedColumn));
    });

    let lines : number = editor.document.lineCount;

    editor.edit((editBuilder : vscode.TextEditorEdit) => {
        for (let i = 0; i < lines; ++i) {
            let line = editor.document.lineAt(i);
            if(line.isEmptyOrWhitespace) {
                continue;
            }
    
            let columns = line.text.split(inputDelimiter);
            let lineColumns : string[] = [];

            transformedSelection.forEach(index => {
                if(index < columns.length) {
                    lineColumns.push(columns[index]);
                }

            });
            
            let formattedText = lineColumns.join(outputDelimiter);
            editBuilder.replace(line.range, formattedText);   
        }
    });
}

function extractColumns() {
    let inputDelimiterOptions : vscode.QuickPickOptions = {};
    inputDelimiterOptions.canPickMany = false;
    inputDelimiterOptions.placeHolder = "Select input delimiter.";

    let outputDelimiterOptions : vscode.QuickPickOptions = {};
    outputDelimiterOptions.canPickMany = false;
    outputDelimiterOptions.placeHolder = "Select output delimiter.";

    let inputBoxOptions : vscode.InputBoxOptions = {};
    inputBoxOptions.value = "0";
    inputBoxOptions.prompt = "Please select columns for extractions. Format:  0,5,3";
    inputBoxOptions.ignoreFocusOut = true;

    
    vscode.window.showQuickPick(whitespaceQuickPickItems, inputDelimiterOptions).then((inputDelimiter) => {
        vscode.window.showQuickPick(whitespaceQuickPickItems, outputDelimiterOptions).then((outputDelimiter) => {
            vscode.window.showInputBox(inputBoxOptions).then((columnsSelection) => {
                if(isUndefined(inputDelimiter) || isUndefined(outputDelimiter) || isUndefined(columnsSelection)) {
                    return;
                }

                try {
                    performExtraction(inputDelimiter.description!, outputDelimiter.description!, columnsSelection);
                } catch (e) {
                    vscode.window.showErrorMessage((<Error>e).message);
                }
            });
        });
    });
}

function replaceWhitespace(text : string) : Promise<string> {
    let promise = new Promise<string>((resolve, reject) => {
        vscode.window.showQuickPick(whitespaceQuickPickItems).then((value) => {
            if(isUndefined(value) || isUndefined(value.description)) {
                reject();
                return;
            }

            resolve(text.replace(/\s+/g, value.description));
        });
    });

    return promise;
}

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand('formatter.replacetrailingwhitespace', () => {
        performFormatting(replaceWhitespace);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('formatter.extractColumns', () => {
        extractColumns();
    }));
}

// this method is called when your extension is deactivated
export function deactivate() {
}