const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('smart.unindent', () => {
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
                editor.edit(
                    (edit) => edit.replace(range, txt.replace(/\S\s{2,}/, (match) => match.trim())),
                    { undoStopBefore: false, undoStopAfter: false }
                )
            } else {
                editor.edit(
                    (edit) => edit.replace(range, txt.replace(new RegExp(`^\\s{${tab_size}}`), '')),
                    { undoStopBefore: false, undoStopAfter: false }
                )
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
