# FluxSQL - Database Diagram Generator

FluxSQL turns PostgreSQL SQL files into visual ER diagrams inside VS Code. Open a `.sql` file, generate the diagram, inspect tables and relationships, then export Mermaid, SVG or FluxSQL JSON artifacts.

## Features

- Visual ER diagram canvas with table nodes and relationship lines.
- Generate diagrams from the active SQL file or the current selection.
- Local PostgreSQL-focused parser for common DDL patterns.
- Export Mermaid (`.mmd`) for docs, GitHub Markdown and Notion.
- Export SVG for presentations, reports and sharing.
- Export `.fluxsql.json` for FluxSQL-compatible workflows.
- Local-first behavior: no cloud upload, no credential collection.

## Quick Start

1. Open a PostgreSQL `.sql` file.
2. Run `FluxSQL: Generate Diagram from SQL File` from the Command Palette.
3. Use the diagram toolbar to adjust the view or export artifacts.

You can also select a SQL snippet and run `FluxSQL: Generate Diagram from Selection`.

## Commands

- `FluxSQL: Open Diagram Editor`
- `FluxSQL: Generate Diagram from SQL File`
- `FluxSQL: Generate Diagram from Selection`
- `FluxSQL: Export Diagram as Mermaid`
- `FluxSQL: Export Diagram as SVG`
- `FluxSQL: Export Diagram as JSON`
- `FluxSQL: Export All Diagram Artifacts`

## Supported SQL in 0.0.1

- `CREATE TABLE`
- inline `PRIMARY KEY`
- table-level `PRIMARY KEY (...)`
- inline `REFERENCES table(column)`
- `ALTER TABLE ... ADD ... FOREIGN KEY ... REFERENCES ...`
- SQL comments using `--` and `/* ... */`

## Exported Files

When possible, FluxSQL writes artifacts beside the active SQL file:

- `<name>.mmd`
- `<name>.svg`
- `<name>.fluxsql.json`

If no file-backed SQL document is available, export commands ask for a save location.

## Security

FluxSQL parses SQL locally in the VS Code extension host. The MVP does not send SQL, database credentials, dumps, backups or private query results to cloud services.

## Settings

- `fluxsql.autoOpenPreview`: automatically open the diagram preview after generation.
- `fluxsql.outputDirectory`: directory for generated `.mmd`, `.svg` and `.fluxsql.json` files. Empty means beside the active SQL file.
- `fluxsql.sidecarUrl`: local FluxSQL sidecar URL reserved for future advanced generation.

## Current Limitations

This preview release focuses on PostgreSQL DDL. Advanced database introspection, live PostgreSQL connections and FluxSQL sidecar integration are planned for later versions.
