const vscode = require('vscode')
const PACKAGE_NAME = 'smart-unindent'

let config = {}

/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    await readConfig()

    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(PACKAGE_NAME)) {
            await readConfig()
        }
    })

    context.subscriptions.push(
        vscode.commands.registerCommand('smart.unindent', async () => {
            let editor = vscode.window.activeTextEditor
            let { document, selections } = editor
            let done = 0

            for (const selection of selections) {
                if (selection.isSingleLine) {
                    let txt
                    let range
                    let regex
                    const { start, end } = selection

                    if (atStartOfLine(selection) && config.removeExtraSpace) {
                        regex = new RegExp(/\S\s{2,}/)
                        txt = document.lineAt(start.line).text
                        range = getRange(selection, txt.length)
                    } else {
                        regex = new RegExp(/(\S\s{2,})$/, 'g')
                        range = getRange(selection, end.character)
                        txt = document.getText(range)
                    }

                    if (regex.test(txt)) {
                        done++
                        await editor.edit(
                            (edit) => edit.replace(range, txt.replace(regex, (match) => match.trim())),
                            { undoStopBefore: false, undoStopAfter: false }
                        )
                    }
                }
            }

            if (selections.length > done) {
                await vscode.commands.executeCommand('editor.action.outdentLines')
            }
        })
    )
}

function getRange(selection, endLength) {
    const { start, end } = selection

    return new vscode.Range(
        start.line,
        0,
        end.line,
        endLength
    )
}

function atStartOfLine(selection) {
    return selection.start.character == 0 && selection.end.character == 0
}

async function readConfig() {
    return config = await vscode.workspace.getConfiguration(PACKAGE_NAME)
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
