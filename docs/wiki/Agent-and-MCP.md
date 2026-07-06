# Agent And MCP

FluxSQL includes a Codex skill for repeatable agent workflows.

Repo-scoped skill:

```txt
.agents/skills/fluxsql-workbench
```

npm package:

```txt
packages/fluxsql-codex-skill
```

Install from npm:

```powershell
npx fluxsql-codex-skill install
```

MCP bridge:

```txt
scripts/fluxsql-mcp-stdio.mjs
```

Runtime endpoint:

```txt
FLUXY_MCP_URL=http://127.0.0.1:<port>/api/v1/mcp/rpc
```

Agents should:

- Read MCP config from `/api/v1/mcp/config`.
- Keep credentials, dumps and private query rows local.
- Prefer safe metadata and diagram operations.
- Ask before destructive SQL, restore operations or cloud sync from local data.
