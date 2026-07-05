import * as path from 'node:path';
import * as vscode from 'vscode';
import { generateDiagramFromSql } from './diagramParser';
import { FluxSqlDiagram } from './diagramTypes';
import { toMermaid } from './mermaid';
import { toSvg } from './svgExport';
import { DiagramPanel } from './webview/diagramPanel';

let currentDiagram: FluxSqlDiagram | undefined;
let currentMermaid = '';
let currentSvg = '';
let currentSourceUri: vscode.Uri | undefined;

type ExportFormat = 'json' | 'mermaid' | 'svg';

export function activate(context: vscode.ExtensionContext): void {
  const openDiagramEditor = vscode.commands.registerCommand('fluxsql.openDiagramEditor', () => {
    showPanel(context);
    if (currentDiagram) {
      DiagramPanel.currentPanel?.sendDiagram(currentDiagram, currentMermaid);
    }
  });

  const generateFromSqlFile = vscode.commands.registerCommand('fluxsql.generateFromSqlFile', async () => {
    await generateFromEditor(context, 'file');
  });

  const generateFromSelection = vscode.commands.registerCommand('fluxsql.generateFromSelection', async () => {
    await generateFromEditor(context, 'selection');
  });

  const exportMermaid = vscode.commands.registerCommand('fluxsql.exportMermaid', async () => {
    await exportCurrent('mermaid');
  });

  const exportJson = vscode.commands.registerCommand('fluxsql.exportJson', async () => {
    await exportCurrent('json');
  });

  const exportSvg = vscode.commands.registerCommand('fluxsql.exportSvg', async () => {
    await exportCurrent('svg');
  });

  const exportAll = vscode.commands.registerCommand('fluxsql.exportAll', async () => {
    await exportAllArtifacts();
  });

  context.subscriptions.push(
    openDiagramEditor,
    generateFromSqlFile,
    generateFromSelection,
    exportMermaid,
    exportJson,
    exportSvg,
    exportAll
  );
}

export function deactivate(): void {
  currentDiagram = undefined;
  currentMermaid = '';
  currentSvg = '';
  currentSourceUri = undefined;
}

function showPanel(context: vscode.ExtensionContext): void {
  DiagramPanel.createOrShow(context.extensionUri, async (message) => {
    if (!isWebviewMessage(message)) {
      return;
    }

    if (message.type === 'generateFromFile') {
      await vscode.commands.executeCommand('fluxsql.generateFromSqlFile');
    } else if (message.type === 'generateFromSelection') {
      await vscode.commands.executeCommand('fluxsql.generateFromSelection');
    } else if (message.type === 'exportMermaid') {
      await vscode.commands.executeCommand('fluxsql.exportMermaid');
    } else if (message.type === 'exportJson') {
      await vscode.commands.executeCommand('fluxsql.exportJson');
    } else if (message.type === 'exportSvg') {
      await vscode.commands.executeCommand('fluxsql.exportSvg');
    } else if (message.type === 'exportAll') {
      await vscode.commands.executeCommand('fluxsql.exportAll');
    }
  });
}

async function generateFromEditor(context: vscode.ExtensionContext, mode: 'file' | 'selection'): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Open a SQL file first.');
    return;
  }

  const sql = mode === 'selection' ? editor.document.getText(editor.selection) : editor.document.getText();
  if (!sql.trim()) {
    vscode.window.showWarningMessage(mode === 'selection' ? 'Select SQL code first.' : 'The active SQL file is empty.');
    return;
  }

  currentDiagram = generateDiagramFromSql(sql);
  currentMermaid = toMermaid(currentDiagram);
  currentSvg = toSvg(currentDiagram);
  currentSourceUri = editor.document.uri.scheme === 'file' ? editor.document.uri : undefined;

  if (getConfig<boolean>('autoOpenPreview', true)) {
    showPanel(context);
  }

  DiagramPanel.currentPanel?.sendDiagram(currentDiagram, currentMermaid);
  await saveArtifacts();

  const warningSuffix = currentDiagram.warnings.length > 0 ? ` ${currentDiagram.warnings.join(' ')}` : '';
  vscode.window.showInformationMessage(
    `FluxSQL generated ${currentDiagram.tables.length} tables and ${currentDiagram.relationships.length} relationships.${warningSuffix}`
  );
}

async function exportCurrent(format: ExportFormat): Promise<void> {
  if (!currentDiagram) {
    vscode.window.showWarningMessage('Generate a FluxSQL diagram before exporting.');
    return;
  }

  try {
    const uri = await writeArtifact(format);
    vscode.window.showInformationMessage(`FluxSQL exported ${path.basename(uri.fsPath)}.`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Export cancelled.') {
      return;
    }
    throw error;
  }
}

async function exportAllArtifacts(): Promise<void> {
  if (!currentDiagram) {
    vscode.window.showWarningMessage('Generate a FluxSQL diagram before exporting.');
    return;
  }

  try {
    const uris = await Promise.all([writeArtifact('json'), writeArtifact('mermaid'), writeArtifact('svg')]);
    vscode.window.showInformationMessage(`FluxSQL exported ${uris.length} files.`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Export cancelled.') {
      return;
    }
    throw error;
  }
}

async function saveArtifacts(): Promise<void> {
  if (!currentDiagram) {
    return;
  }

  if (!canAutoSaveArtifacts()) {
    return;
  }

  await Promise.all([writeArtifact('json'), writeArtifact('mermaid'), writeArtifact('svg')]);
}

async function writeArtifact(format: ExportFormat): Promise<vscode.Uri> {
  if (!currentDiagram) {
    throw new Error('No diagram is available to export.');
  }

  const baseUri = await getOutputBaseUri(format, true);
  const filename = `${baseUri.name}.${getExtension(format)}`;
  const targetUri = vscode.Uri.joinPath(baseUri.directory, filename);
  const content = getArtifactContent(format);

  await vscode.workspace.fs.createDirectory(baseUri.directory);
  await vscode.workspace.fs.writeFile(targetUri, Buffer.from(content, 'utf8'));
  return targetUri;
}

function canAutoSaveArtifacts(): boolean {
  return Boolean(getConfig<string>('outputDirectory', '').trim() || currentSourceUri || vscode.workspace.workspaceFolders?.[0]);
}

async function getOutputBaseUri(format: ExportFormat, promptIfNeeded: boolean): Promise<{ directory: vscode.Uri; name: string }> {
  const configuredDirectory = getConfig<string>('outputDirectory', '').trim();

  if (configuredDirectory) {
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? process.cwd();
    const directory = path.isAbsolute(configuredDirectory)
      ? vscode.Uri.file(configuredDirectory)
      : vscode.Uri.file(path.resolve(workspacePath, configuredDirectory));
    return { directory, name: getSourceBaseName() };
  }

  if (currentSourceUri) {
    return {
      directory: vscode.Uri.file(path.dirname(currentSourceUri.fsPath)),
      name: path.basename(currentSourceUri.fsPath, path.extname(currentSourceUri.fsPath)),
    };
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    return { directory: workspaceFolder.uri, name: 'database' };
  }

  if (!promptIfNeeded) {
    throw new Error('No output location is available.');
  }

  const defaultName = `database.${getExtension(format)}`;
  const selected = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultName),
    filters: getSaveFilters(format),
  });
  if (!selected) {
    throw new Error('Export cancelled.');
  }

  return {
    directory: vscode.Uri.file(path.dirname(selected.fsPath)),
    name: path.basename(selected.fsPath, path.extname(selected.fsPath)).replace(/\.fluxsql$/i, ''),
  };
}

function getSourceBaseName(): string {
  if (!currentSourceUri) {
    return 'database';
  }
  return path.basename(currentSourceUri.fsPath, path.extname(currentSourceUri.fsPath));
}

function getExtension(format: ExportFormat): string {
  if (format === 'json') {
    return 'fluxsql.json';
  }
  if (format === 'svg') {
    return 'svg';
  }
  return 'mmd';
}

function getArtifactContent(format: ExportFormat): string {
  if (!currentDiagram) {
    throw new Error('No diagram is available to export.');
  }

  if (format === 'json') {
    return `${JSON.stringify(currentDiagram, null, 2)}\n`;
  }

  if (format === 'svg') {
    currentSvg = currentSvg || toSvg(currentDiagram);
    return currentSvg;
  }

  return currentMermaid;
}

function getSaveFilters(format: ExportFormat): Record<string, string[]> {
  if (format === 'json') {
    return { 'FluxSQL JSON': ['json'] };
  }
  if (format === 'svg') {
    return { SVG: ['svg'] };
  }
  return { Mermaid: ['mmd'] };
}

function getConfig<T>(key: string, fallback: T): T {
  return vscode.workspace.getConfiguration('fluxsql').get<T>(key, fallback);
}

function isWebviewMessage(message: unknown): message is { type: string } {
  return Boolean(message && typeof message === 'object' && 'type' in message && typeof (message as { type: unknown }).type === 'string');
}
