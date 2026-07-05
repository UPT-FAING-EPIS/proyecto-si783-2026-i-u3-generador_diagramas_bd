import * as vscode from 'vscode';
import { FluxSqlDiagram } from '../diagramTypes';

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

  sendDiagram(diagram: FluxSqlDiagram, mermaid: string): void {
    this.panel.webview.postMessage({ type: 'diagram', diagram, mermaid });
  }

  dispose(): void {
    DiagramPanel.currentPanel = undefined;
    while (this.disposables.length) {
      this.disposables.pop()?.dispose();
    }
  }

  private getHtml(): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>FluxSQL Diagram</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #f8fbff;
      --panel: #ffffff;
      --panel-soft: #f6f8fb;
      --text: #0f172a;
      --muted: #64748b;
      --border: #dbe3ee;
      --blue: #1f6feb;
      --blue-2: #2f7df6;
      --node-head: #1f6feb;
      --node-body: #101722;
      --node-border: #2c3a4d;
      --node-text: #f8fafc;
      --node-muted: #9aa7b8;
      --line: #2275ff;
      --shadow: 0 14px 30px rgba(15, 23, 42, 0.16);
    }

    body.vscode-dark {
      --bg: #0d1117;
      --panel: #151b23;
      --panel-soft: #0f1620;
      --text: #e5edf7;
      --muted: #94a3b8;
      --border: #263241;
      --node-head: #1f6feb;
      --node-body: #111827;
      --node-border: #2d3a4f;
      --shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      overflow: hidden;
      color: var(--text);
      background: var(--bg);
      font-family: var(--vscode-font-family), Segoe UI, sans-serif;
    }

    .shell {
      display: grid;
      grid-template-rows: 58px 1fr;
      width: 100vw;
      height: 100vh;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 0 18px;
      border-bottom: 1px solid var(--border);
      background: var(--panel);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .back {
      display: grid;
      place-items: center;
      width: 30px;
      height: 30px;
      border: 0;
      border-radius: 4px;
      color: var(--muted);
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
      font-weight: 650;
      white-space: nowrap;
    }

    .dialect-tabs {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--panel-soft);
    }

    .tab {
      display: flex;
      align-items: center;
      gap: 7px;
      border: 0;
      border-radius: 12px;
      padding: 8px 16px;
      color: var(--muted);
      background: transparent;
      font: inherit;
      font-weight: 600;
      cursor: default;
      white-space: nowrap;
    }

    .tab.active {
      color: #ffffff;
      background: var(--blue);
      box-shadow: 0 8px 18px rgba(31, 111, 235, 0.25);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--muted);
      white-space: nowrap;
      font-size: 13px;
    }

    .dot {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      border: 2px solid #10b981;
      position: relative;
    }

    .dot::after {
      content: "";
      position: absolute;
      inset: 3px;
      border-radius: inherit;
      background: #10b981;
    }

    button {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 12px;
      color: var(--text);
      background: var(--panel);
      cursor: pointer;
      font: inherit;
      white-space: nowrap;
    }

    button.primary {
      border-color: #111827;
      color: #ffffff;
      background: #0f172a;
    }

    button.blue {
      border-color: var(--blue);
      color: #ffffff;
      background: var(--blue);
    }

    button:hover {
      filter: brightness(0.97);
    }

    .canvas-shell {
      position: relative;
      overflow: hidden;
      background-color: var(--bg);
      background-image:
        radial-gradient(circle, rgba(100, 116, 139, 0.25) 1px, transparent 1px);
      background-size: 18px 18px;
    }

    .stats {
      position: absolute;
      z-index: 5;
      top: 26px;
      left: 26px;
      display: flex;
      gap: 10px;
    }

    .stat {
      min-width: 126px;
      padding: 16px 18px 14px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: color-mix(in srgb, var(--panel) 94%, transparent);
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
    }

    .stat strong {
      display: block;
      font-size: 24px;
      line-height: 1;
      margin-bottom: 8px;
      color: var(--text);
    }

    .stat span {
      color: var(--muted);
      font-size: 13px;
    }

    .warning-panel {
      position: absolute;
      z-index: 7;
      top: 118px;
      left: 26px;
      max-width: 420px;
      display: none;
      border: 1px solid #f59e0b;
      border-radius: 10px;
      padding: 10px 12px;
      color: #92400e;
      background: #fffbeb;
      box-shadow: var(--shadow);
      font-size: 13px;
    }

    .viewport {
      position: absolute;
      inset: 0;
      overflow: auto;
    }

    .diagram-space {
      position: relative;
      width: 2200px;
      height: 1400px;
      transform-origin: 0 0;
    }

    .edges {
      position: absolute;
      inset: 0;
      width: 2200px;
      height: 1400px;
      overflow: visible;
      pointer-events: none;
    }

    .edge {
      fill: none;
      stroke: var(--line);
      stroke-width: 2;
      filter: drop-shadow(0 2px 3px rgba(34, 117, 255, 0.18));
    }

    .edge-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 14;
    }

    .table-node {
      position: absolute;
      width: 224px;
      border: 1px solid var(--node-border);
      border-radius: 9px;
      overflow: hidden;
      color: var(--node-text);
      background: var(--node-body);
      box-shadow: var(--shadow);
    }

    .table-node.compact {
      width: 200px;
    }

    .table-head {
      display: flex;
      align-items: center;
      gap: 7px;
      height: 34px;
      padding: 0 10px;
      background: var(--node-head);
      font-size: 12px;
      font-weight: 700;
    }

    .table-head .icon {
      font-size: 12px;
      opacity: 0.9;
    }

    .columns {
      padding: 5px 0;
    }

    .column {
      display: grid;
      grid-template-columns: 16px minmax(0, 1fr) auto;
      align-items: center;
      gap: 6px;
      min-height: 24px;
      padding: 4px 10px;
      border-top: 1px solid rgba(148, 163, 184, 0.12);
      font-size: 11px;
    }

    .column:first-child {
      border-top: 0;
    }

    .key {
      display: grid;
      place-items: center;
      width: 12px;
      height: 12px;
      color: #facc15;
      font-size: 10px;
    }

    .fk-icon {
      color: #93c5fd;
    }

    .column-name {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--node-text);
    }

    .column-type {
      max-width: 86px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--node-muted);
      font-size: 9px;
      text-align: right;
    }

    .empty {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      color: var(--muted);
      font-size: 15px;
    }

    .minimap {
      position: absolute;
      right: 28px;
      bottom: 78px;
      z-index: 6;
      width: 198px;
      height: 138px;
      border: 1px solid var(--border);
      border-radius: 18px;
      background: color-mix(in srgb, var(--panel) 88%, transparent);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .minimap-node {
      position: absolute;
      border-radius: 1px;
      background: var(--blue);
      opacity: 0.95;
    }

    .bottom-tools {
      position: absolute;
      left: 50%;
      bottom: 24px;
      z-index: 8;
      display: flex;
      overflow: hidden;
      transform: translateX(-50%);
      border: 1px solid var(--border);
      border-radius: 18px;
      background: color-mix(in srgb, var(--panel) 96%, transparent);
      box-shadow: var(--shadow);
    }

    .tool {
      min-width: 104px;
      border: 0;
      border-right: 1px solid var(--border);
      border-radius: 0;
      padding: 11px 14px;
      color: var(--muted);
      background: transparent;
      font-size: 12px;
    }

    .tool:last-child {
      border-right: 0;
    }

    .tool.active {
      color: var(--blue);
      background: color-mix(in srgb, var(--blue) 9%, transparent);
    }

    .tool-icon {
      display: block;
      margin-bottom: 4px;
      font-size: 17px;
      line-height: 1;
    }

    .mermaid-drawer {
      position: absolute;
      right: 28px;
      top: 92px;
      z-index: 9;
      display: none;
      width: min(520px, calc(100vw - 56px));
      max-height: calc(100vh - 190px);
      border: 1px solid var(--border);
      border-radius: 12px;
      background: var(--panel);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .mermaid-drawer.visible {
      display: block;
    }

    .drawer-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      font-weight: 650;
    }

    pre {
      margin: 0;
      padding: 12px;
      max-height: calc(100vh - 245px);
      overflow: auto;
      color: var(--vscode-editor-foreground);
      background: var(--vscode-textCodeBlock-background);
      font-family: var(--vscode-editor-font-family), Consolas, monospace;
      font-size: 12px;
    }

    @media (max-width: 900px) {
      .dialect-tabs,
      .status {
        display: none;
      }

      .stat {
        min-width: 92px;
        padding: 12px;
      }

      .bottom-tools {
        left: 14px;
        right: 14px;
        transform: none;
      }

      .tool {
        min-width: 0;
        flex: 1;
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <button class="back" id="fitTop" title="Fit diagram">←</button>
        <div class="title">FluxSQL Diagram</div>
        <div class="dialect-tabs" aria-label="Dialect">
          <button class="tab active">▣ PostgreSQL</button>
          <button class="tab">▣ MySQL</button>
          <button class="tab">▣ SQL Server</button>
        </div>
      </div>
      <div class="actions">
        <div class="status"><span class="dot"></span><span id="statusText">Ready to generate</span></div>
        <button id="fromFile" class="blue">Generate SQL</button>
        <button id="fromSelection">Selection</button>
        <button id="exportAllTop" class="primary">Exportar todo</button>
      </div>
    </header>

    <main class="canvas-shell">
      <div class="stats">
        <div class="stat"><strong id="tableCount">0</strong><span>Tablas</span></div>
        <div class="stat"><strong id="relationshipCount">0</strong><span>Relaciones</span></div>
        <div class="stat"><strong id="warningCount">0</strong><span>Advertencias</span></div>
      </div>
      <div id="warnings" class="warning-panel"></div>
      <div id="viewport" class="viewport">
        <div id="space" class="diagram-space">
          <svg id="edges" class="edges"></svg>
          <div id="nodes"></div>
          <div id="empty" class="empty">Genera un diagrama desde tu archivo SQL.</div>
        </div>
      </div>
      <div id="minimap" class="minimap"></div>
      <div class="bottom-tools">
        <button id="fit" class="tool"><span class="tool-icon">↗</span>Ajustar</button>
        <button id="layout" class="tool active"><span class="tool-icon">⌘</span>Auto-layout</button>
        <button id="toggleMermaid" class="tool"><span class="tool-icon">▤</span>Mermaid</button>
        <button id="exportMermaid" class="tool"><span class="tool-icon">⇩</span>Mermaid</button>
        <button id="exportSvg" class="tool"><span class="tool-icon">▧</span>SVG</button>
        <button id="exportJsonBottom" class="tool"><span class="tool-icon">▣</span>JSON</button>
      </div>
      <aside id="mermaidDrawer" class="mermaid-drawer">
        <div class="drawer-head">
          <span>Mermaid</span>
          <button id="closeMermaid">Close</button>
        </div>
        <pre id="mermaid"></pre>
      </aside>
    </main>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const viewport = document.getElementById('viewport');
    const space = document.getElementById('space');
    const nodesLayer = document.getElementById('nodes');
    const edgesLayer = document.getElementById('edges');
    const empty = document.getElementById('empty');
    const minimap = document.getElementById('minimap');
    const mermaidDrawer = document.getElementById('mermaidDrawer');
    let currentDiagram;
    let currentMermaid = '';
    let positions = new Map();
    let dragState;

    document.getElementById('fromFile').addEventListener('click', () => vscode.postMessage({ type: 'generateFromFile' }));
    document.getElementById('fromSelection').addEventListener('click', () => vscode.postMessage({ type: 'generateFromSelection' }));
    document.getElementById('exportMermaid').addEventListener('click', () => vscode.postMessage({ type: 'exportMermaid' }));
    document.getElementById('exportAllTop').addEventListener('click', () => vscode.postMessage({ type: 'exportAll' }));
    document.getElementById('exportJsonBottom').addEventListener('click', () => vscode.postMessage({ type: 'exportJson' }));
    document.getElementById('exportSvg').addEventListener('click', () => vscode.postMessage({ type: 'exportSvg' }));
    document.getElementById('fit').addEventListener('click', fitDiagram);
    document.getElementById('fitTop').addEventListener('click', fitDiagram);
    document.getElementById('layout').addEventListener('click', () => {
      if (!currentDiagram) return;
      positions = calculateLayout(currentDiagram);
      renderDiagram();
      fitDiagram();
    });
    document.getElementById('toggleMermaid').addEventListener('click', () => mermaidDrawer.classList.toggle('visible'));
    document.getElementById('closeMermaid').addEventListener('click', () => mermaidDrawer.classList.remove('visible'));

    window.addEventListener('resize', () => {
      drawEdges();
      renderMinimap();
    });

    window.addEventListener('mousemove', (event) => {
      if (!dragState) return;
      const next = {
        x: Math.max(20, dragState.originX + event.clientX - dragState.startX),
        y: Math.max(20, dragState.originY + event.clientY - dragState.startY)
      };
      positions.set(dragState.table, next);
      const node = document.querySelector('[data-table="' + cssEscape(dragState.table) + '"]');
      if (node) {
        node.style.left = next.x + 'px';
        node.style.top = next.y + 'px';
      }
      drawEdges();
      renderMinimap();
    });

    window.addEventListener('mouseup', () => {
      dragState = undefined;
    });

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type !== 'diagram') return;
      currentDiagram = message.diagram;
      currentMermaid = message.mermaid;
      positions = calculateLayout(currentDiagram);
      renderDiagram();
      requestAnimationFrame(fitDiagram);
    });

    function renderDiagram() {
      const tableCount = currentDiagram.tables.length;
      const relationshipCount = currentDiagram.relationships.length;
      const warningCount = currentDiagram.warnings.length;
      document.getElementById('tableCount').textContent = tableCount;
      document.getElementById('relationshipCount').textContent = relationshipCount;
      document.getElementById('warningCount').textContent = warningCount;
      document.getElementById('statusText').textContent = tableCount ? 'Listo para editar' : 'No tables found';
      document.getElementById('mermaid').textContent = currentMermaid;

      const warnings = document.getElementById('warnings');
      if (warningCount) {
        warnings.style.display = 'block';
        warnings.textContent = currentDiagram.warnings.join(' ');
      } else {
        warnings.style.display = 'none';
        warnings.textContent = '';
      }

      empty.style.display = tableCount ? 'none' : 'grid';
      nodesLayer.innerHTML = currentDiagram.tables.map(renderNode).join('');

      for (const node of nodesLayer.querySelectorAll('.table-node')) {
        node.addEventListener('mousedown', (event) => {
          if (event.button !== 0) return;
          const table = node.getAttribute('data-table');
          const position = positions.get(table);
          dragState = {
            table,
            startX: event.clientX,
            startY: event.clientY,
            originX: position.x,
            originY: position.y
          };
          event.preventDefault();
        });
      }

      drawEdges();
      renderMinimap();
    }

    function renderNode(table, index) {
      const position = positions.get(table.name) || { x: 80 + index * 260, y: 180 };
      const compact = table.columns.length <= 4 ? ' compact' : '';
      const columns = table.columns.map((column) => {
        const key = column.primaryKey ? '🔑' : column.foreignKey ? '⌁' : '';
        const keyClass = column.primaryKey ? 'key' : 'key fk-icon';
        return '<div class="column" data-column="' + escapeHtml(column.name) + '">' +
          '<span class="' + keyClass + '">' + key + '</span>' +
          '<span class="column-name" title="' + escapeHtml(column.name) + '">' + escapeHtml(column.name) + '</span>' +
          '<span class="column-type" title="' + escapeHtml(column.type) + '">' + escapeHtml(column.type) + '</span>' +
        '</div>';
      }).join('');

      return '<section class="table-node' + compact + '" data-table="' + escapeHtml(table.name) + '" style="left:' + position.x + 'px;top:' + position.y + 'px">' +
        '<div class="table-head"><span class="icon">▣</span><span>' + escapeHtml(table.name) + '</span></div>' +
        '<div class="columns">' + columns + '</div>' +
      '</section>';
    }

    function drawEdges() {
      edgesLayer.innerHTML = '';
      if (!currentDiagram) return;
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = '<marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L8,3 z" fill="var(--line)"></path></marker>';
      edgesLayer.appendChild(defs);

      currentDiagram.relationships.forEach((relationship, index) => {
        const from = getNodeBox(relationship.fromTable);
        const to = getNodeBox(relationship.toTable);
        if (!from || !to) return;

        const start = anchorPoint(from, to);
        const end = anchorPoint(to, from);
        const midX = (start.x + end.x) / 2;
        const offset = (index % 5) * 10;
        const path = 'M ' + start.x + ' ' + start.y +
          ' C ' + (midX + offset) + ' ' + start.y +
          ', ' + (midX - offset) + ' ' + end.y +
          ', ' + end.x + ' ' + end.y;

        const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hit.setAttribute('d', path);
        hit.setAttribute('class', 'edge-hit');
        edgesLayer.appendChild(hit);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('class', 'edge');
        line.setAttribute('marker-end', 'url(#arrow)');
        edgesLayer.appendChild(line);
      });
    }

    function getNodeBox(tableName) {
      const node = document.querySelector('[data-table="' + cssEscape(tableName) + '"]');
      if (!node) return undefined;
      return {
        x: node.offsetLeft,
        y: node.offsetTop,
        width: node.offsetWidth,
        height: node.offsetHeight
      };
    }

    function anchorPoint(from, to) {
      const fromCenter = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
      const toCenter = { x: to.x + to.width / 2, y: to.y + to.height / 2 };
      if (toCenter.x >= fromCenter.x) {
        return { x: from.x + from.width, y: fromCenter.y };
      }
      return { x: from.x, y: fromCenter.y };
    }

    function calculateLayout(diagram) {
      const layout = new Map();
      const tables = diagram.tables;
      const incoming = new Map(tables.map((table) => [table.name, 0]));
      const outgoing = new Map(tables.map((table) => [table.name, 0]));
      for (const relationship of diagram.relationships) {
        incoming.set(relationship.fromTable, (incoming.get(relationship.fromTable) || 0) + 1);
        outgoing.set(relationship.toTable, (outgoing.get(relationship.toTable) || 0) + 1);
      }

      const sorted = [...tables].sort((a, b) => {
        const scoreA = (outgoing.get(a.name) || 0) - (incoming.get(a.name) || 0);
        const scoreB = (outgoing.get(b.name) || 0) - (incoming.get(b.name) || 0);
        return scoreB - scoreA || a.name.localeCompare(b.name);
      });

      const columns = Math.max(2, Math.ceil(Math.sqrt(Math.max(sorted.length, 1))));
      const xGap = 300;
      const yGap = 190;
      const startX = 520;
      const startY = 180;
      sorted.forEach((table, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const stagger = row % 2 === 0 ? 0 : 80;
        layout.set(table.name, {
          x: startX + col * xGap + stagger,
          y: startY + row * yGap
        });
      });

      return layout;
    }

    function fitDiagram() {
      if (!currentDiagram || !currentDiagram.tables.length) return;
      const boxes = currentDiagram.tables.map((table) => getNodeBox(table.name)).filter(Boolean);
      if (!boxes.length) return;
      const minX = Math.min(...boxes.map((box) => box.x));
      const minY = Math.min(...boxes.map((box) => box.y));
      const maxX = Math.max(...boxes.map((box) => box.x + box.width));
      const maxY = Math.max(...boxes.map((box) => box.y + box.height));
      const width = maxX - minX;
      const height = maxY - minY;
      viewport.scrollTo({
        left: Math.max(0, minX - Math.max(80, (viewport.clientWidth - width) / 2)),
        top: Math.max(0, minY - Math.max(90, (viewport.clientHeight - height) / 2)),
        behavior: 'smooth'
      });
    }

    function renderMinimap() {
      minimap.innerHTML = '';
      if (!currentDiagram || !currentDiagram.tables.length) return;
      const boxes = currentDiagram.tables.map((table) => getNodeBox(table.name)).filter(Boolean);
      if (!boxes.length) return;
      const minX = Math.min(...boxes.map((box) => box.x));
      const minY = Math.min(...boxes.map((box) => box.y));
      const maxX = Math.max(...boxes.map((box) => box.x + box.width));
      const maxY = Math.max(...boxes.map((box) => box.y + box.height));
      const scale = Math.min(170 / Math.max(1, maxX - minX), 108 / Math.max(1, maxY - minY));
      for (const box of boxes) {
        const node = document.createElement('div');
        node.className = 'minimap-node';
        node.style.left = 14 + (box.x - minX) * scale + 'px';
        node.style.top = 14 + (box.y - minY) * scale + 'px';
        node.style.width = Math.max(10, box.width * scale) + 'px';
        node.style.height = Math.max(4, box.height * scale) + 'px';
        minimap.appendChild(node);
      }
    }

    function cssEscape(value) {
      if (window.CSS && CSS.escape) return CSS.escape(value);
      return String(value).replace(/"/g, '\\"');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char]));
    }
  </script>
</body>
</html>`;
  }
}

function getNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let value = '';
  for (let index = 0; index < 32; index += 1) {
    value += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return value;
}
