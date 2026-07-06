export const webviewStyles = `
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
      transition: stroke 0.2s, opacity 0.2s;
    }

    .edges.has-hover .edge {
      opacity: 0.15;
    }

    .edges.has-hover .edge.highlight {
      opacity: 1;
      stroke: #38bdf8;
      stroke-width: 3;
    }

    .edge-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 14;
      pointer-events: auto;
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
      cursor: pointer;
    }

    .table-node.compact {
      width: 200px;
    }

    .graph-node {
      position: absolute;
      padding: 12px 24px;
      border: 1px solid var(--blue);
      border-radius: 99px;
      color: var(--node-text);
      background: var(--node-body);
      box-shadow: 0 0 0 2px rgba(31, 111, 235, 0.2), var(--shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    }

    .graph-name {
      display: flex;
      align-items: center;
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
      display: flex;
      justify-content: center;
      margin-bottom: 6px;
      color: var(--muted);
    }
    
    .tool:hover .tool-icon, .tool.active .tool-icon {
      color: var(--blue);
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
`;
