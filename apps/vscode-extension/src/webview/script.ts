export const webviewScript = `
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
    let currentSvg = '';
    let positions = new Map();
    let dragState;

    document.getElementById('exportMermaid').addEventListener('click', () => vscode.postMessage({ type: 'exportMermaid' }));
    document.getElementById('exportPickerTop').addEventListener('click', () => vscode.postMessage({ type: 'exportDiagram' }));
    document.getElementById('exportJsonBottom').addEventListener('click', () => vscode.postMessage({ type: 'exportJson' }));
    document.getElementById('exportSvg').addEventListener('click', () => vscode.postMessage({ type: 'exportSvg' }));
    
    document.getElementById('exportPng').addEventListener('click', () => {
      if (!currentSvg) return;
      const blob = new Blob([currentSvg], {type: 'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#f8fbff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        vscode.postMessage({ type: 'savePng', data: dataUrl });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

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
      if (message.type === 'requestPngExport') {
        document.getElementById('exportPng').click();
        return;
      }
      if (message.type !== 'diagram') return;
      currentDiagram = message.diagram;
      currentMermaid = message.mermaid;
      currentSvg = message.svg;
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
      const entityLabel = currentDiagram.renderMode === 'graph' ? 'nodos' : 'tablas';
      document.getElementById('statusText').textContent = tableCount ? 'Listo para editar ' + entityLabel : 'No entities found';
      
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

      for (const node of nodesLayer.querySelectorAll('.table-node, .graph-node')) {
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

        node.addEventListener('mouseenter', () => {
          const table = node.getAttribute('data-table');
          edgesLayer.classList.add('has-hover');
          for (const edge of edgesLayer.querySelectorAll('.edge, .edge-hit')) {
            if (edge.getAttribute('data-source') === table || edge.getAttribute('data-target') === table) {
              edge.classList.add('highlight');
            }
          }
        });

        node.addEventListener('mouseleave', () => {
          edgesLayer.classList.remove('has-hover');
          for (const edge of edgesLayer.querySelectorAll('.edge, .edge-hit')) {
            edge.classList.remove('highlight');
          }
        });
      }

      drawEdges();
      renderMinimap();
    }

    function renderNode(table, index) {
      const position = positions.get(table.name) || { x: 80 + index * 260, y: 180 };
      const isGraph = currentDiagram.renderMode === 'graph';

      if (isGraph) {
        return '<section class="graph-node" data-table="' + escapeHtml(table.name) + '" style="left:' + position.x + 'px;top:' + position.y + 'px">' +
          '<div class="graph-name"><svg style="margin-right:8px;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>' + escapeHtml(table.name) + '</div>' +
        '</section>';
      }

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
        const offset = (index % 5) * 12;
        const mX = midX + offset;

        const path = 'M ' + start.x + ' ' + start.y +
          ' L ' + mX + ' ' + start.y +
          ' L ' + mX + ' ' + end.y +
          ' L ' + end.x + ' ' + end.y;

        const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        hit.setAttribute('d', path);
        hit.setAttribute('class', 'edge-hit');
        hit.setAttribute('data-source', relationship.fromTable);
        hit.setAttribute('data-target', relationship.toTable);
        edgesLayer.appendChild(hit);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        line.setAttribute('d', path);
        line.setAttribute('class', 'edge');
        line.setAttribute('marker-end', 'url(#arrow)');
        line.setAttribute('data-source', relationship.fromTable);
        line.setAttribute('data-target', relationship.toTable);
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
        outgoing.set(relationship.fromTable, (outgoing.get(relationship.fromTable) || 0) + 1);
        incoming.set(relationship.toTable, (incoming.get(relationship.toTable) || 0) + 1);
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
      return String(value).replace(/"/g, '\\\\\"');
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
`;
