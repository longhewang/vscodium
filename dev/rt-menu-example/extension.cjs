const vscode = require('vscode');

exports.activate = context => {
  context.subscriptions.push(vscode.commands.registerCommand('rt.example.trace', () => {
    vscode.window.showInformationMessage('RT menu contribution works. Connect your ray tracing implementation here.');
  }));
};
