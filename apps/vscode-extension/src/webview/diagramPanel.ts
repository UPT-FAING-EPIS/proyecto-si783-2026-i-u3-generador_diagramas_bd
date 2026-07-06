import * as vscode from 'vscode';
import { FluxSqlDiagram } from '../diagramTypes';
import { getWebviewHtml } from './template';

export class DiagramPanel {
  static currentPanel: DiagramPanel | undefined;

  private readonly panel: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  static createOrShow(extensionUri: vscode.Uri, onMessage: (message: unknown) => void): DiagramPanel {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (DiagramPanel.currentPanel) {
      DiagramPanel.currentPanel.panel.reveal(column);
      return DiagramPanel.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'fluxsqlDiagram',
      'FluxSQL Diagram',
      column ?? vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')],
      }
    );

    DiagramPanel.currentPanel = new DiagramPanel(panel, onMessage);
    return DiagramPanel.currentPanel;
  }

  private constructor(panel: vscode.WebviewPanel, onMessage: (message: unknown) => void) {
    this.panel = panel;
    this.panel.webview.html = this.getHtml();

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
    this.panel.webview.onDidReceiveMessage(onMessage, null, this.disposables);
  }

  sendDiagram(diagram: FluxSqlDiagram, mermaid: string, svg: string): void {
    this.panel.webview.postMessage({ type: 'diagram', diagram, mermaid, svg });
  }

  requestPngExport(): void {
    this.panel.webview.postMessage({ type: 'requestPngExport' });
  }

  dispose(): void {
    DiagramPanel.currentPanel = undefined;
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }

  private getHtml(): string {
    const nonce = getNonce();
    return getWebviewHtml(nonce);
  }
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
