# FluxSQL Codex Skill

Installs the `fluxsql-workbench` Codex skill into a project.

```powershell
npx fluxsql-codex-skill install
```

The installer creates:

```txt
.agents/skills/fluxsql-workbench
```

It will not overwrite an existing skill unless you pass `--force`:

```powershell
npx fluxsql-codex-skill install --force
```

Use the skill in Codex with:

```txt
$fluxsql-workbench
```

The skill covers FluxSQL web, desktop, local sidecar, MCP, Docker test databases, sync troubleshooting, the VS Code extension, and Marketplace/package workflows.

## Development

```powershell
npm pack --dry-run
npm publish --access public
```
