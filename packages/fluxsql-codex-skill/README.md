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

The skill covers FluxSQL web, cloud API, desktop, local sidecar, MCP, local memory boundaries, Docker test databases, VPS deployment, sync troubleshooting, GitHub releases, the VS Code extension, npm publishing and Marketplace workflows.

## Development

```powershell
npm pack --dry-run
npm publish --access public
```

The repository also includes a GitHub Actions workflow for publishing from `skill-v*` tags after npm trusted publishing or `NPM_TOKEN` is configured.
