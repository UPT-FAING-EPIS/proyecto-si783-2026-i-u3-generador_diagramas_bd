# FluxSQL - Database Diagram Generator

FluxSQL turns SQL and NoSQL schema code into visual database diagrams inside VS Code. It supports relational table diagrams for SQL engines and graph-style diagrams for document/graph engines such as MongoDB and Neo4j.

![FluxSQL thumbnail](media/thumbnail.png)

## Features

- Guided generation flow: choose `SQL` or `NoSQL`, then choose the database engine.
- SQL diagrams for PostgreSQL, MySQL/MariaDB, SQL Server and SQLite DDL.
- NoSQL diagrams for MongoDB native scripts, Mongoose schemas, Prisma models, JSON documents and Neo4j/Cypher.
- Relational rendering with tables, columns, primary keys and foreign keys.
- Graph rendering for MongoDB/Mongoose/JSON/Neo4j relationships.
- Export picker for Mermaid, SVG, PNG, FluxSQL JSON or all artifacts.
- Local-first behavior: no cloud upload, no credential collection.

## Quick Start

1. Open a schema file, for example `.sql`, `.json`, `.js`, `.ts`, `.prisma` or `.cypher`.
2. Run `FluxSQL: Generate Diagram from File` from the Command Palette.
3. Select the diagram family:
   - `SQL` for relational databases.
   - `NoSQL` for documents, collections or graphs.
4. Select the engine so FluxSQL knows how to parse and render the diagram.
5. Use `FluxSQL: Export Diagram...` or the preview toolbar to export artifacts.

You can also select a snippet and run `FluxSQL: Generate Diagram from Selection`.

## Commands

- `FluxSQL: Open Diagram Editor`
- `FluxSQL: Generate Diagram from File`
- `FluxSQL: Generate Diagram from Selection`
- `FluxSQL: Export Diagram...`
- `FluxSQL: Export Diagram as Mermaid`
- `FluxSQL: Export Diagram as SVG`
- `FluxSQL: Export Diagram as PNG`
- `FluxSQL: Export Diagram as JSON`
- `FluxSQL: Export All Diagram Artifacts`

## Supported Engines

SQL:

- PostgreSQL
- MySQL / MariaDB
- SQL Server
- SQLite

NoSQL:

- MongoDB native scripts
- Mongoose schemas
- Prisma models
- JSON document structures
- Neo4j / Cypher

## Exported Files

When possible, FluxSQL writes artifacts beside the active source file in `fluxsql-exports`:

- `<name>.mmd`
- `<name>.svg`
- `<name>.png`
- `<name>.fluxsql.json`

If no file-backed document is available, export commands ask for a save location.

## GitHub Versioning

The repository includes a `Publish VS Code Extension` GitHub Actions workflow. To package and publish a new extension version:

1. Update `apps/vscode-extension/package.json` version.
2. Push a tag like `vscode-v0.0.2`.
3. GitHub Actions packages the `.vsix`, calculates checksums and creates release assets.
4. If repository secret `VSCE_PAT` is configured, the workflow also publishes to Visual Studio Marketplace.

## Settings

- `fluxsql.autoOpenPreview`: automatically open the diagram preview after generation.
- `fluxsql.outputDirectory`: directory for generated artifacts. Empty means beside the active source file.
- `fluxsql.sidecarUrl`: local FluxSQL sidecar URL reserved for future advanced generation.

## Security

FluxSQL parses schema text locally in the VS Code extension host. It does not send SQL, NoSQL documents, database credentials, dumps, backups or private query results to cloud services.
