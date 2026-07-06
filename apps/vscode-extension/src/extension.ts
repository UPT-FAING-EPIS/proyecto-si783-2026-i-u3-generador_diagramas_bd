import * as path from 'node:path';
import * as vscode from 'vscode';
import { generateDiagramFromCode } from './diagramParser';
import { FluxSqlDiagram } from './diagramTypes';
import { toMermaid } from './mermaid';
import { toSvg } from './svgExport';
import { DiagramPanel } from './webview/diagramPanel';

let currentDiagram: FluxSqlDiagram | undefined;
let currentMermaid = '';
let currentSvg = '';
let currentSourceUri: vscode.Uri | undefined;

type ExportFormat = 'json' | 'mermaid' | 'svg' | 'png';
type EngineFamily = 'sql' | 'nosql';
type EngineOption = {
  label: string;
  description: string;
  detail: string;
  value: FluxSqlDiagram['dialect'];
  family: EngineFamily;
};

const engineOptions: EngineOption[] = [
  { label: 'PostgreSQL', description: 'SQL relacional', detail: 'CREATE TABLE, claves primarias y foraneas.', value: 'postgresql', family: 'sql' },
  { label: 'MySQL / MariaDB', description: 'SQL relacional', detail: 'DDL MySQL con relaciones entre tablas.', value: 'mysql', family: 'sql' },
  { label: 'SQL Server', description: 'SQL relacional', detail: 'DDL T-SQL y tablas relacionales.', value: 'sqlserver', family: 'sql' },
  { label: 'SQLite', description: 'SQL relacional', detail: 'DDL ligero para apps locales.', value: 'sqlite', family: 'sql' },
  { label: 'MongoDB', description: 'NoSQL documento/grafo', detail: 'db.collection.insertOne/insertMany y documentos JSON-like.', value: 'mongodb', family: 'nosql' },
  { label: 'Mongoose', description: 'NoSQL documento/grafo', detail: 'Schema/model con refs entre colecciones.', value: 'mongoose', family: 'nosql' },
  { label: 'Prisma', description: 'Modelo de datos', detail: 'model, @id y @relation.', value: 'prisma', family: 'nosql' },
  { label: 'Neo4j / Cypher', description: 'NoSQL grafo', detail: 'Nodos, labels y relaciones Cypher.', value: 'neo4j', family: 'nosql' },
  { label: 'JSON', description: 'NoSQL documento/grafo', detail: 'Objetos con colecciones y relaciones opcionales.', value: 'json', family: 'nosql' },
];

export function activate(context: vscode.ExtensionContext): void {
  const openDiagramEditor = vscode.commands.registerCommand('fluxsql.openDiagramEditor', () => {
    showPanel(context);
    if (currentDiagram) {
      DiagramPanel.currentPanel?.sendDiagram(currentDiagram, currentMermaid, currentSvg);
    }
  });

  const generateFromFile = vscode.commands.registerCommand('fluxsql.generateFromFile', async () => {
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

  const exportDiagram = vscode.commands.registerCommand('fluxsql.exportDiagram', async () => {
    await exportWithPicker();
  });

  const exportPng = vscode.commands.registerCommand('fluxsql.exportPng', async () => {
    DiagramPanel.currentPanel?.requestPngExport();
  });

  const exportAll = vscode.commands.registerCommand('fluxsql.exportAll', async () => {
    await exportAllArtifacts();
  });

  context.subscriptions.push(
    openDiagramEditor,
    generateFromFile,
    generateFromSelection,
    exportMermaid,
    exportJson,
    exportSvg,
    exportDiagram,
    exportPng,
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
      await vscode.commands.executeCommand('fluxsql.generateFromFile');
    } else if (message.type === 'generateFromSelection') {
      await vscode.commands.executeCommand('fluxsql.generateFromSelection');
    } else if (message.type === 'exportMermaid') {
      await vscode.commands.executeCommand('fluxsql.exportMermaid');
    } else if (message.type === 'exportJson') {
      await vscode.commands.executeCommand('fluxsql.exportJson');
    } else if (message.type === 'exportSvg') {
      await vscode.commands.executeCommand('fluxsql.exportSvg');
    } else if (message.type === 'exportPng') {
      await vscode.commands.executeCommand('fluxsql.exportPng');
    } else if (message.type === 'savePng') {
      const data = (message as any).data;
      const base64 = data.replace(/^data:image\/png;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      saveBufferArtifact('png', buffer).catch(console.error);
    } else if (message.type === 'exportDiagram') {
      await vscode.commands.executeCommand('fluxsql.exportDiagram');
    } else if (message.type === 'exportAll') {
      await vscode.commands.executeCommand('fluxsql.exportAll');
    } else if (message.type === 'changeDialect') {
      const dialect = (message as any).dialect;
      await generateFromEditor(context, 'file', dialect);
    }
  });
}

async function generateFromEditor(context: vscode.ExtensionContext, mode: 'file' | 'selection', forceDialect?: string): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('Open a database or code file first.');
    return;
  }

  const code = mode === 'selection' ? editor.document.getText(editor.selection) : editor.document.getText();
  if (!code.trim()) {
    vscode.window.showWarningMessage(mode === 'selection' ? 'Select code first.' : 'The active file is empty.');
    return;
  }

  const selectedEngine = await pickEngine(forceDialect);
  if (!selectedEngine) return;

  const languageId = selectedEngine.value;
  currentDiagram = generateDiagramFromCode(code, languageId);
  currentMermaid = toMermaid(currentDiagram);
  currentSvg = toSvg(currentDiagram);
  currentSourceUri = editor.document.uri.scheme === 'file' ? editor.document.uri : undefined;

  if (getConfig<boolean>('autoOpenPreview', true)) {
    showPanel(context);
  }

  DiagramPanel.currentPanel?.sendDiagram(currentDiagram, currentMermaid, currentSvg);

  const warningSuffix = currentDiagram.warnings.length > 0 ? ` ${currentDiagram.warnings.join(' ')}` : '';
  const action = await vscode.window.showInformationMessage(
    `FluxSQL generated ${currentDiagram.tables.length} tables and ${currentDiagram.relationships.length} relationships.${warningSuffix}`,
    'Exportar...'
  );
  if (action === 'Exportar...') {
    await exportWithPicker();
  }
}

async function pickEngine(forceDialect?: string): Promise<EngineOption | undefined> {
  if (forceDialect) {
    return engineOptions.find((option) => option.value === forceDialect);
  }

  const family = await vscode.window.showQuickPick([
    { label: 'SQL', description: 'Tablas relacionales con PK/FK', value: 'sql' as const },
    { label: 'NoSQL', description: 'Documentos, colecciones o grafos', value: 'nosql' as const },
  ], {
    placeHolder: 'Que tipo de diagrama quieres generar?',
  });

  if (!family) return undefined;

  return vscode.window.showQuickPick(
    engineOptions.filter((option) => option.family === family.value),
    {
      placeHolder: family.value === 'sql'
        ? 'Selecciona el motor SQL'
        : 'Selecciona el motor NoSQL',
    }
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

async function exportWithPicker(): Promise<void> {
  if (!currentDiagram) {
    vscode.window.showWarningMessage('Generate a FluxSQL diagram before exporting.');
    return;
  }

  const selected = await vscode.window.showQuickPick([
    { label: 'Mermaid (.mmd)', description: currentDiagram.renderMode === 'graph' ? 'flowchart LR' : 'erDiagram', value: 'mermaid' as const },
    { label: 'SVG (.svg)', description: 'Vector para informes y presentaciones', value: 'svg' as const },
    { label: 'PNG (.png)', description: 'Imagen generada desde el preview', value: 'png' as const },
    { label: 'FluxSQL JSON (.fluxsql.json)', description: 'Paquete interoperable de FluxSQL', value: 'json' as const },
    { label: 'Todos los artefactos', description: 'Mermaid, SVG y JSON', value: 'all' as const },
  ], {
    placeHolder: `Exportar diagrama ${currentDiagram.dialect}`,
  });

  if (!selected) return;
  if (selected.value === 'all') {
    await exportAllArtifacts();
  } else if (selected.value === 'png') {
    DiagramPanel.currentPanel?.requestPngExport();
  } else {
    await exportCurrent(selected.value);
  }
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

async function saveBufferArtifact(format: ExportFormat, buffer: Buffer): Promise<void> {
  try {
    const baseUri = await getOutputBaseUri(format, true);
    const filename = `${baseUri.name}.${getExtension(format)}`;
    const targetUri = vscode.Uri.joinPath(baseUri.directory, filename);
    await vscode.workspace.fs.createDirectory(baseUri.directory);
    await vscode.workspace.fs.writeFile(targetUri, buffer);
    vscode.window.showInformationMessage(`FluxSQL exported ${filename}.`);
  } catch (error) {
    if (error instanceof Error && error.message === 'Export cancelled.') return;
    throw error;
  }
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
      directory: vscode.Uri.file(path.join(path.dirname(currentSourceUri.fsPath), 'fluxsql-exports')),
      name: path.basename(currentSourceUri.fsPath, path.extname(currentSourceUri.fsPath)),
    };
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (workspaceFolder) {
    return { directory: vscode.Uri.joinPath(workspaceFolder.uri, 'fluxsql-exports'), name: 'database' };
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
  if (format === 'png') {
    return 'png';
  }
  return 'mmd';
}

function getArtifactContent(format: ExportFormat): string {
  if (!currentDiagram) {
    throw new Error('No diagram is available to export.');
  }
  if (format === 'png') {
    throw new Error('PNG export is handled asynchronously by webview');
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
  if (format === 'png') {
    return { PNG: ['png'] };
  }
  return { Mermaid: ['mmd'] };
}

function getConfig<T>(key: string, fallback: T): T {
  return vscode.workspace.getConfiguration('fluxsql').get<T>(key, fallback);
}

function isWebviewMessage(message: unknown): message is { type: string } {
  return Boolean(message && typeof message === 'object' && 'type' in message && typeof (message as { type: unknown }).type === 'string');
}
