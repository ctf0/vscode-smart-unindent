const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('smart.unindent', async () => {
        let editor = vscode.window.activeTextEditor
        const { document, selections } = editor
        let done = 0

        for (const selection of selections) {
            let tab_size = editor.options.tabSize
            const { start, end } = selection

            let range = new vscode.Range(
                start.line,
                0,
                end.line,
                end.character
            )
            let txt = document.getText(range)
            let regex = /\S\s{2,}/

            if (range.isSingleLine && regex.test(txt)) {
                done++
                await editor.edit(
                    (edit) => edit.replace(range, txt.replace(regex, (match) => match.trim())),
                    { undoStopBefore: false, undoStopAfter: false }
                )
            }
        }

        if (selections.length > done) {
            await vscode.commands.executeCommand('editor.action.outdentLines')
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
