<div align="center">
  <h1>🚀 FluxSQL Workbench Skill</h1>
  <p><strong>La Habilidad de Agente de IA Definitiva para el Entorno de FluxSQL</strong></p>
  
  [![npm version](https://badge.fury.io/js/fluxsql-skill.svg)](https://badge.fury.io/js/fluxsql-skill)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

---

¡Bienvenido a **FluxSQL Skill**! Este paquete proporciona la inteligencia, los flujos de trabajo y las instrucciones necesarias para que los agentes de Inteligencia Artificial (como OpenAI Codex o modelos en entornos de VS Code) interactúen, gestionen y desplieguen cualquier parte del ecosistema de **FluxSQL Workbench**.

Si eres un desarrollador trabajando con agentes IA para potenciar tu flujo de trabajo de bases de datos, este paquete dota a tu agente de un "cerebro" específico para FluxSQL.

## ✨ ¿Qué hace esta skill?

**FluxSQL Skill** capacita a tu agente de IA para entender completamente la arquitectura de FluxSQL. Le permite:

- 🏗️ **Construir y Empaquetar:** Compilar la API en la nube, la aplicación de escritorio y la extensión de Visual Studio Code (`.vsix`).
- 🐳 **Desplegar Bases de Datos de Prueba:** Levantar contenedores Docker de PostgreSQL/MySQL en segundos de manera segura (sin tocar datos de producción).
- 🌐 **Gestionar el Ecosistema:** Arrancar y monitorizar la App Web (`dev:web`), la Cloud API (`dev:api`), y el Sidecar local (`dev:local-sidecar`).
- 🔧 **Troubleshooting Avanzado:** Solucionar problemas de puertos, salud del puente MCP, sincronizaciones de estado y fallos de *linter*.
- 🚀 **Despliegues a Producción:** Entender la configuración de Caddy, VPS, GitHub Actions y secretos de entorno.

## 📦 Instalación

Puedes instalar esta skill globalmente o dentro de tu entorno de agentes:

```bash
npm install -g fluxsql-skill
```

O como dependencia en tu proyecto de agentes:

```bash
npm install fluxsql-skill --save
```

## 🛠️ ¿Cómo usarlo con tu Agente de IA?

La magia principal de este paquete reside en el archivo `SKILL.md` y los `scripts/` incluidos. Solo necesitas indicar a tu agente IA (ej. Cline, Cursor, GitHub Copilot) que **lea las instrucciones de esta skill**:

> *"Agente, por favor lee las instrucciones en `node_modules/fluxsql-skill/SKILL.md` y úsalas como base para cualquier operación en el proyecto FluxSQL."*

### Scripts Rápidos (Helper Scripts)

El paquete incluye scripts en PowerShell que el agente de IA puede ejecutar por ti para automatizar el día a día:

| Script | Descripción |
| --- | --- |
| `check_fluxsql_workspace.ps1` | Verifica que el entorno esté correctamente configurado. |
| `start_fluxsql_demo.ps1` | Levanta todo el entorno local (Web + API + DBs) para demostraciones. |
| `package_vscode_extension.ps1` | Empaqueta la extensión oficial de VS Code limpia y lista para el Marketplace. |

## ⚙️ Reglas Core que tu Agente Aprenderá

Al utilizar este paquete, el agente IA obedecerá automáticamente estrictas reglas de seguridad y arquitectura, como:
1. **Nunca** enviar credenciales reales, respaldos (dumps) o datos de producción a endpoints en la nube.
2. Usar credenciales de demostración de manera desechable.
3. Priorizar los scripts del `package.json` oficial antes de inventar comandos nuevos.
4. Jamás hacer *commit* de variables de entorno `.env` ni secretos.

---

<div align="center">
  <p>Construido con ❤️ para hacer el desarrollo de bases de datos impulsado por IA más rápido y seguro.</p>
</div>
