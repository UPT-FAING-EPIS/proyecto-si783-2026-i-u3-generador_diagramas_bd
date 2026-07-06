import { webviewStyles } from './styles';
import { webviewScript } from './script';

export function getWebviewHtml(nonce: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' data: blob: vscode-resource:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>FluxSQL Diagram</title>
  <style>
${webviewStyles}
  </style>
</head>
<body>
  <div class="shell">
    <header class="topbar">
      <div class="brand">
        <button class="back" id="fitTop" title="Fit diagram">←</button>
        <div class="title">FluxSQL Diagram</div>
      </div>
      <div class="actions">
        <div class="status"><span class="dot"></span><span id="statusText">Ready to generate</span></div>
        <button id="exportPickerTop" class="primary">Exportar...</button>
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
          <div id="empty" class="empty">Genera un diagrama SQL o NoSQL desde tu archivo activo.</div>
        </div>
      </div>
      <div id="minimap" class="minimap"></div>
      <div class="bottom-tools">
        <button id="fit" class="tool">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></span>
          Ajustar
        </button>
        <button id="layout" class="tool active">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span>
          Auto-layout
        </button>
        <button id="toggleMermaid" class="tool">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg></span>
          Mermaid
        </button>
        <button id="exportMermaid" class="tool">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></span>
          Exp. MMD
        </button>
        <button id="exportSvg" class="tool">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg></span>
          SVG
        </button>
        <button id="exportPng" class="tool">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
          PNG
        </button>
        <button id="exportJsonBottom" class="tool">
          <span class="tool-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h10"/></svg></span>
          JSON
        </button>
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
${webviewScript}
  </script>
</body>
</html>`;
}
