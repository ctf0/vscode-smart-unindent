const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('smart.unindent', async () => {
        let editor = vscode.window.activeTextEditor
        const { document, selections } = editor

        for (const selection of selections) {
            let tab_size = editor.options.tabSize
            let active = selection.active
            let range = new vscode.Range(
                active.line,
                0,
                active.line,
                active.character
            )
            let txt = document.getText(range)

            if (/\S\s{2,}/.test(txt)) {
                await editor.edit(
                    (edit) => edit.replace(range, txt.replace(/\S\s{2,}/, (match) => match.trim())),
                    { undoStopBefore: false, undoStopAfter: false }
                )
            } else {
                let regex = new RegExp(`^\\s{${tab_size}}`)

                if (regex.test(txt)) {
                    await editor.edit(
                        (edit) => edit.replace(range, txt.replace(regex, '')),
                        { undoStopBefore: false, undoStopAfter: false }
                    )
                } else {
                    await vscode.commands.executeCommand('editor.action.outdentLines')
                }
            }
        }
    })

    context.subscriptions.push(disposable)
}
exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
