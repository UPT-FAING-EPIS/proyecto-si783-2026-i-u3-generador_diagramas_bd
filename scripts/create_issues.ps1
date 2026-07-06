$issues = @(
    @{
        title = "Issue 1: Setup del Cloud API con NestJS y Autenticación"
        body = "**Historia de Usuario:** COMO Arquitecto de Software QUIERO implementar un Cloud API en NestJS con JWT PARA proteger las rutas de sincronización de diagramas.`n`n**Criterios de Aceptación:** AuthGuard implementado. Ninguna contraseña de DB se guarda en el servidor.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que un cliente no autenticado intenta hacer PUSH de un diagrama`n- **CUANDO** realiza la petición HTTP POST a /diagrams`n- **ENTONCES** el servidor debe rechazar la conexión con un HTTP 401 Unauthorized."
        label = "enhancement"
    },
    @{
        title = "Issue 2: Configuración del Lienzo Interactivo Frontend"
        body = "**Historia de Usuario:** COMO Desarrollador Frontend QUIERO configurar Next.js con React Flow PARA tener un lienzo base de arrastre de nodos.`n`n**Criterios de Aceptación:** Renderizado estable a 60fps con hasta 50 nodos.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el usuario abre el editor web`n- **CUANDO** arrastra un nodo (Tabla) por el lienzo interactivo`n- **ENTONCES** las aristas (relaciones) deben actualizar su ruta dinámicamente sin degradación de rendimiento."
        label = "enhancement"
    },
    @{
        title = "Issue 3: Despliegue en Servidor VPS con Caddy y Docker"
        body = "**Historia de Usuario:** COMO Ingeniero DevOps QUIERO orquestar la infraestructura con Docker Compose PARA desplegar en el VPS con certificados HTTPS automáticos.`n`n**Criterios de Aceptación:** Caddy Reverse Proxy activo emitiendo certificados SSL.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el código se fusiona en la rama main`n- **CUANDO** GitHub Actions ejecuta el script de deploy en el VPS`n- **ENTONCES** el servicio web debe estar accesible vía HTTPS en el dominio .sytes.net."
        label = "enhancement"
    },
    @{
        title = "Issue 4: Integración Continua de Seguridad Estática"
        body = "**Historia de Usuario:** COMO Ingeniero de Seguridad QUIERO un pipeline de validación estática PARA evitar la inyección de vulnerabilidades en el código base.`n`n**Criterios de Aceptación:** Integración de SonarQube, Semgrep y Snyk obligatoria.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que un desarrollador sube código con secretos expuestos`n- **CUANDO** Semgrep y SonarQube analizan el Pull Request`n- **ENTONCES** la acción debe fallar y bloquear la fusión del código vulnerable."
        label = "security"
    },
    @{
        title = "Issue 5: Empaquetado Binario Nativo con Tauri"
        body = "**Historia de Usuario:** COMO Arquitecto Desktop QUIERO usar Tauri con Rust PARA generar un ejecutable ligero y nativo del cliente.`n`n**Criterios de Aceptación:** Binario menor a 50MB que no requiera Chromium o Node.js preinstalado.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el usuario descarga el release oficial`n- **CUANDO** ejecuta el instalador nativo .exe o .msi`n- **ENTONCES** la aplicación debe arrancar fluidamente de forma independiente."
        label = "enhancement"
    },
    @{
        title = "Issue 6: Sidecar de Introspección Local en FastAPI"
        body = "**Historia de Usuario:** COMO Ingeniero Backend QUIERO un subproceso local en Python PARA conectar físicamente a las bases de datos corporativas sin exponer puertos a internet.`n`n**Criterios de Aceptación:** FastAPI debe inicializar SQLAlchemy correctamente y validar conexión TCP/IP.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el Sidecar recibe credenciales de PostgreSQL`n- **CUANDO** intenta el protocolo TCP Handshake`n- **ENTONCES** debe devolver un objeto JSON con las tablas extraídas del Information Schema."
        label = "enhancement"
    },
    @{
        title = "Issue 7: Parser Bidireccional para MongoDB"
        body = "**Historia de Usuario:** COMO Analista de Datos QUIERO soporte documental PARA diagramar colecciones de MongoDB y sus documentos anidados.`n`n**Criterios de Aceptación:** El parser debe inferir sub-tipos BSON.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el usuario importa un JSON Schema válido`n- **CUANDO** el parser TypeScript procesa los datos`n- **ENTONCES** debe generar múltiples entidades interconectadas simulando las subcolecciones."
        label = "bug"
    },
    @{
        title = "Issue 8: Soporte para Bases de Grafos (Neo4j)"
        body = "**Historia de Usuario:** COMO Arquitecto de Datos QUIERO parsear scripts Cypher PARA visualizar nodos y relaciones de grafos nativos.`n`n**Criterios de Aceptación:** Etiquetas de arco (Edge Labels) habilitadas.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que se ingresa un script Cypher MATCH (a)-[r:KNOWS]->(b)`n- **CUANDO** React Flow renderiza la estructura`n- **ENTONCES** la flecha conectora debe mostrar explícitamente la etiqueta KNOWS."
        label = "bug"
    },
    @{
        title = "Issue 9: Optimización de Enrutamiento Ortogonal"
        body = "**Historia de Usuario:** COMO Diseñador UI QUIERO reparar el renderizado de conexiones PARA evitar superposiciones confusas sobre las tablas.`n`n**Criterios de Aceptación:** Algoritmo smoothstep habilitado con evasión de obstáculos.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que hay tres nodos alineados linealmente`n- **CUANDO** se traza una relación entre el primero y el tercero`n- **ENTONCES** la flecha debe trazar una ruta perimetral de 90 grados evadiendo el nodo central."
        label = "bug"
    },
    @{
        title = "Issue 10: Automatización de Release Público en NPM"
        body = "**Historia de Usuario:** COMO Ingeniero Release QUIERO un workflow de GitHub Actions PARA subir la Skill a la red global de NPM.`n`n**Criterios de Aceptación:** Publicación sin intervención humana.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que se modifica la versión en package.json de .agents/skills`n- **CUANDO** el Pull Request es fusionado en main`n- **ENTONCES** NPM debe publicar el paquete omitiendo la validación 2FA (token Automation)."
        label = "enhancement"
    },
    @{
        title = "Issue 11: Distribución en GitHub Packages (GPR)"
        body = "**Historia de Usuario:** COMO Administrador del Repo QUIERO publicar el paquete en GPR PARA control y distribución interna.`n`n**Criterios de Aceptación:** El Scope organizacional @UPT-FAING-EPIS debe añadirse automáticamente.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el Job de GPR arranca en Actions`n- **CUANDO** se configura registry-url a npm.pkg.github.com`n- **ENTONCES** el comando npm publish debe subir el paquete asociándolo directamente al repositorio orgánico."
        label = "enhancement"
    },
    @{
        title = "Issue 12: Integración de Lienzo en Webview de VS Code"
        body = "**Historia de Usuario:** COMO Programador QUIERO ver mis diagramas ER sin salir de VS Code PARA mantener la fluidez en el desarrollo.`n`n**Criterios de Aceptación:** El Webview debe enviar mensajes RPC a la API principal del editor.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el usuario presiona 'FluxSQL: Show Diagram' sobre un .sql`n- **CUANDO** la extensión intercepta el comando`n- **ENTONCES** debe inyectar el código frontend de React Flow dentro de un panel lateral."
        label = "enhancement"
    },
    @{
        title = "Issue 13: Branding Oficial y Publicación Marketplace"
        body = "**Historia de Usuario:** COMO Product Manager QUIERO estandarizar la identidad visual de la extensión PARA mejorar la retención de usuarios.`n`n**Criterios de Aceptación:** Icono .png y README renderizado.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que GitHub Actions empaqueta el archivo .vsix`n- **CUANDO** el comando vsce publish es ejecutado`n- **ENTONCES** el logo oficial debe estar visible en la página pública del Microsoft Marketplace."
        label = "enhancement"
    },
    @{
        title = "Issue 14: Garbage Collection Optimizado en el Sidecar"
        body = "**Historia de Usuario:** COMO Ingeniero de Performance QUIERO optimizar el uso de memoria RAM en el proceso de FastAPI PARA soportar esquemas masivos.`n`n**Criterios de Aceptación:** Liberación de cursores de BD explícita.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el Sidecar inspecciona 500 tablas`n- **CUANDO** termina de transformar el JSON`n- **ENTONCES** el recolector de basura debe destruir las conexiones huérfanas, retornando a <150MB de uso de RAM."
        label = "enhancement"
    },
    @{
        title = "Issue 15: Conexión mediante Model Context Protocol (MCP)"
        body = "**Historia de Usuario:** COMO Agente IA (Codex) QUIERO un puente estándar MCP PARA inspeccionar la estructura de la base de datos de manera autónoma.`n`n**Criterios de Aceptación:** Servidor MCP Stdout/Stdin implementado.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el Agente IA solicita herramientas disponibles`n- **CUANDO** invoca el tool analyze_local_database`n- **ENTONCES** el puente MCP le entregará el SchemaModel de forma sanitizada (Zero-Trust)."
        label = "enhancement"
    },
    @{
        title = "Issue 16: Generador de Reportes de Rendimiento AI"
        body = "**Historia de Usuario:** COMO Administrador de BD QUIERO que la IA genere un QueryAnalysisReport PARA detectar preventivamente falta de índices o malas prácticas.`n`n**Criterios de Aceptación:** Exportación en Markdown con hallazgos clave.`n`n**Escenario de Prueba (Gherkin):**`n- **DADO** que el agente termina de analizar el diagrama y las consultas frecuentes`n- **CUANDO** el usuario aprueba la auditoría`n- **ENTONCES** la UI debe renderizar un documento técnico sugiriendo optimizaciones precisas (ej. índices B-Tree)."
        label = "enhancement"
    }
)

Write-Host "Creando 16 Issues en GitHub..."
foreach ($issue in $issues) {
    Write-Host "-> Creando: $($issue.title)"
    gh issue create --title $issue.title --body $issue.body --label $issue.label
}
Write-Host "Todos los issues fueron creados exitosamente."
