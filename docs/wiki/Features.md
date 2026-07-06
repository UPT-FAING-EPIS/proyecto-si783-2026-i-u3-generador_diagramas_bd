# Features

## Implemented

- Diagram editor with database-focused graph canvas.
- Project dashboard and version snapshots.
- Public diagram sharing flow.
- Desktop local-first workflows with FastAPI sidecar.
- PostgreSQL, MySQL, MongoDB, Redis and Neo4j demo databases.
- Safe connector layer for schema inspection.
- MCP bridge for local agent integrations.
- VS Code extension that generates diagrams from SQL and exports Mermaid, SVG and JSON.
- GitHub Actions for desktop releases, secure CI, VPS deployment and package publishing.

## Security Boundaries

- Local database credentials stay in the desktop/local runtime.
- Cloud sync accepts safe diagram and project artifacts only.
- Production secrets are stored as GitHub Secrets or VPS environment files, never in Git.
- Caddy terminates HTTPS for the public No-IP domain.
