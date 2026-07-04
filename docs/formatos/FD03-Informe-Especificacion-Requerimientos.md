<center>

![Logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

**Informe de Especificación de Requerimientos**

**Plataforma de Modelado y Sincronización de Diagramas (FluxSQL)**

Curso: *Gestión de Proyectos / Ingeniería de Software*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna - Perú**

***2026***

</center>

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

Sistema *Plataforma de Modelado y Sincronización de Diagramas (FluxSQL)*

Informe de Especificación de Requerimientos

Versión *2.1*

| CONTROL DE VERSIONES |           |              |               |            |                 |
|:--------------------:|:----------|:-------------|:--------------|:-----------|:----------------|
|       Versión        | Hecha por | Revisada por | Aprobada por  | Fecha      | Motivo          |
|         1.0          | KHZM, JAVE| KHZM, JAVE   | P. Cuadros Q. | 2026-04-22 | Versión inicial (DBCanvas) |
|         2.0          | KHZM, JAVE| KHZM, JAVE   | P. Cuadros Q. | 2026-06-25 | Actualización de arquitectura (Sidecar / Cloud) |
|         2.1          | KHZM, JAVE| KHZM, JAVE   | P. Cuadros Q. | 2026-07-04 | Unificación a nuevo formato institucional BDD |

# ÍNDICE GENERAL

1. [Introducción](#1-introducción)
2. [Generalidades de la Empresa](#2-generalidades-de-la-empresa)
    1. [Nombre de la Empresa](#21-nombre-de-la-empresa)
    2. [Visión](#22-visión)
    3. [Misión](#23-misión)
    4. [Organigrama](#24-organigrama)
3. [Visionamiento de la Empresa](#3-visionamiento-de-la-empresa)
    1. [Descripcion del problema](#31-descripcion-del-problema)
    2. [Objetivo de Negocios](#32-objetivo-de-negocios)
    3. [Objetivo de diseño](#33-objetivo-de-diseño)
    4. [Alcance del proyecto](#34-alcance-del-proyecto)
    5. [Viabilidad del sistema](#35-viabilidad-del-sistema)
    6. [Informacion obtenida del Levantamiento de informacion](#36-informacion-obtenida-del-levantamiento-de-informacion)
4. [Analisis de procesos](#4-analisis-de-procesos)
    1. [Diagrama de Procesos Actual](#41-diagrama-de-procesos-actual)
    2. [Diagrama de Procesos Propuesto](#42-diagrama-de-procesos-propuesto)
5. [Especificacion de Requerimientos de Software](#5-especificacion-de-requerimientos-de-software)
    1. [Cuadro de Requerimientos funcionales Inicial](#51-cuadro-de-requerimientos-funcionales-inicial)
    2. [Cuadro de Requerimientos no funcionales](#52-cuadro-de-requerimientos-no-funcionales)
    3. [Cuadro de Requerimientos funcionales Final](#53-cuadro-de-requerimientos-funcionales-final)
    4. [Regla de Negocio](#54-regla-de-negocio)
6. [Fase de Desarrollo](#6-fase-de-desarrollo)
    1. [Perfil del Usuario](#61-perfil-del-usuario)
    2. [Modelo Conceptual](#62-modelo-conceptual)
        1. [Diagrama de paquetes](#621-diagrama-de-paquetes)
        2. [Diagrama de casos de uso](#622-diagrama-de-casos-de-uso)
        3. [Escenarios de casos de uso (narrativas)](#623-escenarios-de-casos-de-uso-narrativas)
    3. [Modelo Lógico](#63-modelo-lógico)
        1. [Analisis de Objetos](#631-analisis-de-objetos)
        2. [Diagrama de Actividades con objetos](#632-diagrama-de-actividades-con-objetos)
        3. [Diagrama de secuencia](#633-diagrama-de-secuencia)
        4. [Diagrama de clases](#634-diagrama-de-clases)
7. [Conclusiones](#7-conclusiones)
8. [Recomendaciones](#8-recomendaciones)
9. [Bibliografia](#9-bibliografia)
10. [Webgrafia](#10-webgrafia)
11. [Historias de Usuario, Criterios y Escenarios BDD](#11-historias-de-usuario-criterios-y-escenarios-bdd)

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

# 1. Introducción

El presente Informe de Especificación de Requerimientos de Software (ERS) define, de manera verificable, las capacidades
funcionales y no funcionales del sistema **FluxSQL**. Este documento integra la visión académica del proyecto (FD02), la factibilidad evaluada (FD01) y el estado actual del código fuente en el monorepo para asegurar la trazabilidad real entre requisitos e implementación.

FluxSQL es una plataforma orientada al modelado de bases de datos que permite la creación manual de diagramas mediante código DDL o la extracción automatizada de esquemas directamente desde motores locales (PostgreSQL, MySQL, SQLite, etc.) utilizando un Sidecar en Python. El sistema garantiza un entorno híbrido donde los artefactos seguros se sincronizan con la nube (NestJS), mientras que las credenciales permanecen estrictamente cifradas en el equipo del usuario (Tauri).

# 2. Generalidades de la Empresa

## 2.1 Nombre de la empresa

Universidad Privada de Tacna – Facultad de Ingeniería – Escuela Profesional de Ingeniería de Sistemas.

## 2.2 Visión

Formar profesionales líderes, innovadores y comprometidos con la calidad, capaces de desarrollar soluciones tecnológicas
aplicadas a problemas reales del entorno.

## 2.3 Misión

Brindar formación integral en ingeniería de software, promoviendo investigación aplicada, ética profesional y producción
de software de calidad con impacto académico y social.

## 2.4 Organigrama

```mermaid
flowchart TD
    UPT["Universidad Privada de Tacna"] --> FI["Facultad de Ingeniería"]
    FI --> EPIS["Escuela Profesional de Ingeniería de Sistemas"]
    EPIS --> CURSO["Curso: Gestión de Proyectos / Ing. Software"]
    CURSO --> DOC["Docente Evaluador"]
    CURSO --> EQ["Equipo del Proyecto FluxSQL"]
```

# 3. Visionamiento de la Empresa

## 3.1 Descripcion del problema

En el ámbito del diseño de bases de datos, los equipos técnicos enfrentan dificultades para documentar esquemas heredados ("legacy") y mantener sincronizados los diagramas relacionales con la base de datos real. Las soluciones existentes en la nube obligan a exponer cadenas de conexión y puertos sensibles en internet, comprometiendo la seguridad corporativa.

## 3.2 Objetivo de negocios

Proveer una herramienta de modelado visual que reduzca el tiempo de documentación de bases de datos, garantizando la seguridad de las credenciales mediante procesamiento local, y facilitando la colaboración en equipo a través de la sincronización en la nube de diagramas estandarizados.

## 3.3 Objetivo de diseño

Diseñar una solución híbrida y modular (Monorepo) que incluya:
- Una **Web App** (Next.js) para la colaboración y diseño manual mediante DDL.
- Un **Cloud API** (NestJS) para gestionar proyectos y persistir modelos estandarizados de manera segura.
- Una **Desktop App** local (Tauri + FastAPI Sidecar) que se encargue de la introspección segura de bases de datos conectadas en intranets o redes privadas sin exponer los datos sensibles.

## 3.4 Alcance del proyecto

**Incluido en la versión actual:**
- Modelado de bases de datos mediante editor de texto (DDL) y parsers.
- Extracción automatizada de esquemas mediante un ejecutable local (Sidecar FastAPI).
- Soporte para múltiples motores: PostgreSQL, MySQL, SQLite, MongoDB y SQL Server.
- Visualización interactiva de diagramas Entidad-Relación usando Mermaid.js.
- Sincronización híbrida: *SchemaModel* JSON a la nube; credenciales cifradas localmente.
- Gestión básica de proyectos, usuarios y versionado.

**Fuera de alcance en la versión actual:**
- Migraciones inversas automáticas (alterar la BD desde el diagrama interactivo).
- Reemplazo total de clientes SQL pesados (DBeaver, DataGrip).

## 3.5 Viabilidad del sistema

De acuerdo al FD01, la viabilidad del sistema es **alta**. La combinación de tecnologías open-source maduras (React, NestJS, FastAPI, Rust/Tauri) minimiza costos operativos. La estrategia de un Sidecar para conectividad elimina los obstáculos legales y de seguridad (no se requieren servidores perimetrales ni abrir puertos a internet).

## 3.6 Informacion obtenida del levantamiento de informacion

Fuentes de entrada para este ERS:
- Documento de factibilidad (`docs/formatos/FD01-Informe-Factibilidad (6).md`).
- Documento de visión (`docs/formatos/FD02-Informe-Vision (1).md`).
- Código fuente y estructura del monorepo (`apps/web`, `apps/backend-api`, `apps/desktop`).

# 4. Analisis de procesos

## 4.1 Diagrama de procesos actual

Modelado y documentación manual sin integración híbrida.

```mermaid
flowchart LR
    A[Data Engineer examina BD manual] --> B[Anota tablas, columnas y FKs en bloc de notas]
    B --> C[Usa herramienta web de diagramado genérica]
    C --> D[Dibuja rectángulos y flechas a mano]
    D --> E[Exporta PNG y lo comparte por correo]
    E --> F[La BD cambia, el PNG queda obsoleto]
```

## 4.2 Diagrama de procesos propuesto

Modelado híbrido y automatizado con FluxSQL.

```mermaid
flowchart LR
    A["Usuario instala FluxSQL Desktop"] --> B["Registra credenciales seguras de BD local"]
    B --> C["Local Sidecar extrae metadatos (Information Schema)"]
    C --> D["Sidecar convierte a SchemaModel JSON"]
    D --> E["Tauri UI renderiza diagrama Mermaid automáticamente"]
    E --> F["Usuario edita el diagrama o añade notas"]
    F --> G["Sincronización a Cloud API NestJS sin enviar credenciales"]
    G --> H["Equipo consulta la versión actualizada en Web App"]
```

# 5. Especificacion de Requerimientos de Software

## 5.1 Cuadro de requerimientos funcionales inicial

| ID     | Requerimiento funcional inicial   | Criterio general de aceptación                                        |
|--------|-----------------------------------|-----------------------------------------------------------------------|
| RFI-01 | Crear diagrama manual (DDL)       | El usuario ingresa código SQL DDL y el sistema dibuja el ERD.         |
| RFI-02 | Conectar a BD Local               | El Sidecar acepta parámetros de conexión y ejecuta `ping`.            |
| RFI-03 | Extraer tablas y relaciones       | El Sidecar obtiene llaves primarias, foráneas y tipos de datos.       |
| RFI-04 | Convertir a modelo estándar       | La metadata cruda se transforma a un objeto `SchemaModel` universal.  |
| RFI-05 | Visualizar diagrama ERD           | El sistema renderiza el diagrama interactivamente usando Mermaid.     |
| RFI-06 | Gestionar proyectos y versiones   | Un diagrama puede ser versionado y asociado a un proyecto en la nube. |
| RFI-07 | Sincronización segura             | Solo el `SchemaModel` se sube al Cloud API; nunca las credenciales.   |

## 5.2 Cuadro de requerimientos no funcionales

| ID     | Requerimiento no funcional | Métrica / Umbral                                               | Evidencia esperada                                           |
|--------|----------------------------|----------------------------------------------------------------|--------------------------------------------------------------|
| RNF-01 | **Seguridad Híbrida**      | Cero (0) credenciales almacenadas en la base de datos Cloud    | Análisis de código del NestJS API y base de datos            |
| RNF-02 | **Rendimiento UI**         | Renderizado de modelos < 500 ms (hasta 100 tablas)             | Carga dinámica controlada por *debounce* en editor de código |
| RNF-03 | **Portabilidad Desktop**   | Ejecutable nativo Tauri para Windows/Linux/macOS               | Binarios cruzados compilados sin requerir Python externo     |
| RNF-04 | **Eficiencia Memoria**     | Consumo RAM en estado de reposo < 150 MB                       | Benchmark en Administrador de Tareas (vs Electron)           |
| RNF-05 | **Escalabilidad Cloud**    | Operaciones *stateless* soportando balanceo de carga           | Infraestructura Serverless/Docker en NestJS                  |

## 5.3 Cuadro de requerimientos funcionales final

| ID    | Requerimiento funcional final                                                             | Prioridad | Trazabilidad técnica (módulo/código)                                                                                |
|-------|-------------------------------------------------------------------------------------------|-----------|---------------------------------------------------------------------------------------------------------------------|
| RF-01 | Registrar y autenticar usuarios (JWT)                                                     | Alta      | `apps/backend-api` (NestJS AuthGuard)                                                                               |
| RF-02 | Parsear scripts SQL DDL y JSON Schema en el cliente                                       | Alta      | `packages/parsers/SQLDDLParser.ts`                                                                                  |
| RF-03 | Administrar múltiples perfiles de conexión local cifrada                                  | Alta      | `apps/desktop/backend-python/connection_manager.py`                                                                 |
| RF-04 | Extraer esquemas desde PostgreSQL y MySQL locales                                         | Alta      | `apps/desktop/backend-python/extractors/`                                                                           |
| RF-05 | Transformar metadata heterogénea al formato `SchemaModel`                                 | Alta      | `packages/parsers/SchemaModel.ts`                                                                                   |
| RF-06 | Renderizar diagramas usando motor gráfico dinámico Mermaid                                | Alta      | `packages/ui/DiagramViewer.tsx`                                                                                     |
| RF-07 | Sincronizar (Push/Pull) artefactos de diseño entre Local y Nube                           | Alta      | `apps/backend-api/diagrams.controller.ts`                                                                           |
| RF-08 | Integrar un puente local para Skills y agentes IA (MCP)                                   | Media     | `apps/desktop/backend-python/mcp_bridge.py`                                                                         |
| RF-09 | Exportar diagramas a formatos PNG/SVG descargables                                        | Media     | `packages/ui/ExportTools.ts`                                                                                        |

## 5.4 Regla de negocio

| ID    | Regla de negocio                                                                                    | Aplicación                                     |
|-------|-----------------------------------------------------------------------------------------------------|------------------------------------------------|
| RN-01 | **Zero-Trust Connection**: El NestJS Cloud API rechazará estructuralmente cualquier carga útil que contenga hosts, usuarios o contraseñas de bases de datos. | `CloudSyncService.ts` / DTO Validation en NestJS |
| RN-02 | El `SchemaModel` es la única fuente de verdad para el dibujado visual; el parser nunca debe graficar directamente. | Flujo de Datos Arquitectónico                  |
| RN-03 | Las contraseñas de conexión a bases de datos locales deben almacenarse en el Keyring cifrado del Sistema Operativo huésped. | `CryptoService.py` en FastAPI Sidecar          |

# 6. Fase de Desarrollo

## 6.1 Perfil del usuario

| Perfil                      | Características                           | Necesidades principales                       |
|-----------------------------|-------------------------------------------|-----------------------------------------------|
| Analista de Datos / DBA     | Conoce credenciales de conexión interna   | Generar diagramas ERD sin exponer IPs locales |
| Desarrollador Backend       | Escribe esquemas SQL frecuentemente       | Ver los cambios de su DDL en tiempo real      |
| Desarrollador Frontend      | Consume diagramas documentados            | Consultar el proyecto online sin instalar nada|
| Administrador (Team Lead)   | Organiza espacios de trabajo y accesos    | Dashboard centralizado en la nube (Web App)   |

## 6.2 Modelo Conceptual

### 6.2.1 Diagrama de paquetes

```mermaid
flowchart TD
    WEB["apps/web : Next.js UI"]
    DESK["apps/desktop : Tauri"]
    API["apps/backend-api : NestJS"]
    SIDE["apps/desktop/backend-python : FastAPI"]
    PKG_UI["packages/ui : React Components"]
    PKG_PRS["packages/parsers : Data Modeling"]

    WEB --> PKG_UI
    WEB --> PKG_PRS
    DESK --> PKG_UI
    DESK --> PKG_PRS
    DESK --> SIDE
    WEB -.->|HTTP/JSON| API
    DESK -.->|HTTPS Sync| API
```

### 6.2.2 Inventario de Casos de Uso (20 CUs)

Para abarcar exhaustivamente el sistema implementado en la arquitectura híbrida (Tauri, Next.js, NestJS y FastAPI), se han definido **20 Casos de Uso** reales agrupados por módulos funcionales.

#### Módulo I: Autenticación y Nube (NestJS API)
1. **CU-01:** Iniciar sesión de usuario (JWT).
2. **CU-02:** Registrar nueva cuenta de usuario.
3. **CU-03:** Cerrar sesión de usuario.
4. **CU-04:** Visualizar galería de proyectos guardados.
5. **CU-05:** Crear nuevo proyecto de modelado en blanco.
6. **CU-06:** Guardar / Sincronizar estado del diagrama (Push).
7. **CU-07:** Cargar / Restaurar diagrama desde la nube (Pull).
8. **CU-08:** Eliminar proyecto de la nube.

#### Módulo II: Modelado Manual (Parsers TypeScript)
9. **CU-09:** Ingresar script SQL DDL manualmente.
10. **CU-10:** Parsear script DDL a diagrama en tiempo real.
11. **CU-11:** Ingresar estructura mediante JSON Schema.
12. **CU-12:** Parsear JSON Schema a diagrama.

#### Módulo III: Interacción y Exportación (UI Mermaid.js)
13. **CU-13:** Ampliar o reducir lienzo (Zoom In/Out).
14. **CU-14:** Desplazarse por el diagrama (Paneo).
15. **CU-15:** Exportar diagrama a imagen PNG.
16. **CU-16:** Exportar diagrama a vector SVG.
17. **CU-17:** Exportar diagrama a código Mermaid nativo.

#### Módulo IV: Extracción Local (Sidecar FastAPI)
18. **CU-18:** Registrar credenciales de Base de Datos local.
19. **CU-19:** Ejecutar introspección de Base de Datos local.
20. **CU-20:** Transformar metadatos crudos a `SchemaModel`.

### 6.2.3 Escenarios y Diagramas de Casos de Uso

A continuación se detallan y grafican los 20 Casos de Uso implementados en FluxSQL.

#### CU-01: Iniciar sesión de usuario
**Actor:** Usuario
**Descripción:** El usuario se autentica contra el API Cloud para obtener un JWT válido.
```mermaid
sequenceDiagram
    Usuario->>UI: Ingresa email y contraseña
    UI->>NestJS Cloud: POST /auth/login
    NestJS Cloud-->>UI: 200 OK (Devuelve JWT Token)
```

#### CU-02: Registrar nueva cuenta de usuario
**Actor:** Usuario
**Descripción:** Creación de una nueva identidad en la base de datos de usuarios en la nube.
```mermaid
sequenceDiagram
    Usuario->>UI: Completa formulario de registro
    UI->>NestJS Cloud: POST /auth/register
    NestJS Cloud-->>UI: 201 Created (Usuario registrado)
```

#### CU-03: Cerrar sesión de usuario
**Actor:** Usuario
**Descripción:** Se destruye el token local del usuario, finalizando su acceso a la nube.
```mermaid
flowchart LR
    U["Usuario"] -->|Cierra sesión| A["Limpia LocalStorage"]
    A --> B["Redirige a /login"]
```

#### CU-04: Visualizar galería de proyectos guardados
**Actor:** Usuario Autenticado
**Descripción:** El sistema consulta al Cloud API todos los diagramas asociados al usuario.
```mermaid
sequenceDiagram
    UI->>NestJS Cloud: GET /projects (con JWT)
    NestJS Cloud-->>UI: 200 OK (Array de Proyectos)
    UI->>Usuario: Muestra galería de tarjetas
```

#### CU-05: Crear nuevo proyecto de modelado
**Actor:** Usuario Autenticado
**Descripción:** Se inicializa un lienzo en blanco para un nuevo diagrama de base de datos.
```mermaid
flowchart LR
    A["Usuario hace clic en Nuevo"] --> B["UI genera UUID temporal"]
    B --> C["Se inicializa SchemaModel vacío"]
    C --> D["Abre lienzo de Mermaid"]
```

#### CU-06: Guardar / Sincronizar estado del diagrama (Push)
**Actor:** Usuario Autenticado
**Descripción:** Se envía el JSON abstracto del diagrama actual hacia el backend NestJS.
```mermaid
sequenceDiagram
    Usuario->>UI: Clic en Guardar
    UI->>NestJS Cloud: PUT /projects/{id} (SchemaModel)
    NestJS Cloud-->>UI: 200 OK (Sincronizado)
```

#### CU-07: Cargar / Restaurar diagrama desde la nube (Pull)
**Actor:** Usuario Autenticado
**Descripción:** Descarga un diagrama previamente guardado y lo renderiza en pantalla.
```mermaid
sequenceDiagram
    UI->>NestJS Cloud: GET /projects/{id}
    NestJS Cloud-->>UI: 200 OK (Retorna SchemaModel)
    UI->>UI: Mermaid dibuja diagrama
```

#### CU-08: Eliminar proyecto de la nube
**Actor:** Usuario Autenticado
**Descripción:** Eliminación lógica o física de un proyecto en la base de datos remota.
```mermaid
flowchart LR
    A["Usuario confirma eliminación"] --> B["DELETE /projects/{id}"]
    B --> C["NestJS borra registro"]
    C --> D["UI actualiza galería"]
```

#### CU-09: Ingresar script SQL DDL manualmente
**Actor:** Usuario (Frontend)
**Descripción:** Interacción con el editor de código integrado (Monaco Editor) para escribir sentencias CREATE TABLE.
```mermaid
flowchart LR
    U["Usuario"] -->|Escribe DDL| E["Monaco Editor"]
    E -->|Resalta sintaxis SQL| U
```

#### CU-10: Parsear script DDL a diagrama
**Actor:** Parser Automático (Client-side)
**Descripción:** El código DDL se compila en el navegador a un objeto JSON, generando el modelo visual.
```mermaid
sequenceDiagram
    Editor->>SQLDDLParser: Pasa string SQL DDL (Debounce 300ms)
    SQLDDLParser-->>UI: Retorna SchemaModel
    UI->>UI: Dibuja ERD en Mermaid
```

#### CU-11: Ingresar estructura mediante JSON Schema
**Actor:** Usuario (Frontend)
**Descripción:** Similar al DDL, pero ingresando objetos JSON para modelado de colecciones NoSQL.
```mermaid
flowchart LR
    U["Usuario"] -->|Escribe JSON| E["Monaco Editor JSON"]
    E -->|Valida llaves| U
```

#### CU-12: Parsear JSON Schema a diagrama
**Actor:** Parser Automático (Client-side)
**Descripción:** Transforma la jerarquía JSON en un esquema relacional visual.
```mermaid
sequenceDiagram
    Editor->>JSONParser: Pasa string JSON
    JSONParser-->>UI: Retorna SchemaModel
    UI->>UI: Dibuja ERD en Mermaid
```

#### CU-13: Ampliar o reducir lienzo (Zoom)
**Actor:** Usuario
**Descripción:** Uso del scroll o botones para acercar/alejar la vista del diagrama Mermaid.
```mermaid
flowchart LR
    A["Usuario hace Scroll"] --> B["D3.js Zoom Module"]
    B --> C["Escala SVG ViewBox"]
```

#### CU-14: Desplazarse por el diagrama (Paneo)
**Actor:** Usuario
**Descripción:** Arrastrar el lienzo para inspeccionar áreas ocultas de diagramas masivos.
```mermaid
flowchart LR
    A["Usuario arrastra ratón"] --> B["D3.js Pan Module"]
    B --> C["Traslada SVG ViewBox X, Y"]
```

#### CU-15: Exportar diagrama a imagen PNG
**Actor:** Usuario
**Descripción:** Renderiza el SVG actual a un Canvas HTML5 y lo descarga como `.png`.
```mermaid
sequenceDiagram
    Usuario->>UI: Clic Exportar PNG
    UI->>UI: Convierte SVG a Canvas
    UI->>Usuario: Forza descarga de archivo png
```

#### CU-16: Exportar diagrama a vector SVG
**Actor:** Usuario
**Descripción:** Descarga limpia del nodo DOM SVG generado por Mermaid.
```mermaid
flowchart LR
    A["Extraer tag svg"] --> B["Codificar a Base64 / Blob"]
    B --> C["Descargar archivo svg"]
```

#### CU-17: Exportar diagrama a código Mermaid
**Actor:** Usuario
**Descripción:** Se recupera el texto plano que alimenta al renderizador gráfico.
```mermaid
flowchart LR
    A["Obtener string mmd"] --> B["Crear Blob texto plano"]
    B --> C["Descargar archivo mmd"]
```

#### CU-18: Registrar credenciales de Base de Datos local
**Actor:** DBA / Usuario Técnico (Desktop)
**Descripción:** Guarda en la aplicación de escritorio las IPs y claves de acceso.
```mermaid
sequenceDiagram
    DBA->>Tauri UI: Ingresa Host, DB, User, Pass
    Tauri UI->>OS Keyring: Almacena contraseña cifrada
    Tauri UI->>Local Storage: Almacena Host y Puerto
```

#### CU-19: Ejecutar introspección de Base de Datos local
**Actor:** Python Sidecar (Backend Local)
**Descripción:** Se conecta al motor local y consulta la tabla `information_schema` o `sqlite_master`.
```mermaid
sequenceDiagram
    Tauri UI->>FastAPI Sidecar: POST /extract
    FastAPI Sidecar->>DB Local: SELECT * FROM information_schema
    DB Local-->>FastAPI Sidecar: Retorna tablas, columnas y FKs
```

#### CU-20: Transformar metadatos crudos a SchemaModel
**Actor:** Python Sidecar (Backend Local)
**Descripción:** Convierte los tipos de datos dispares (PG, MySQL) a la interfaz universal JSON.
```mermaid
flowchart LR
    A["Metadatos Crudos PG / MySQL"] --> B["Python Schema Mapper"]
    B --> C["Serializa a SchemaModel JSON"]
    C --> D["Retorna JSON a Tauri UI"]
```

## 6.3 Modelo Lógico

### 6.3.1 Analisis de objetos

| Objeto                                            | Responsabilidad                                                  | Tipo                         |
|---------------------------------------------------|------------------------------------------------------------------|------------------------------|
| `SchemaModel`                                     | Estructura JSON universal (Tablas, Atributos, Relaciones)        | DTO / Entidad Dominio        |
| `SQLDDLParser`                                    | Transforma texto SQL crudo en `SchemaModel`                      | Servicio de Dominio          |
| `ConnectionManager`                               | Almacena localmente las cadenas de conexión                      | Servicio Sidecar (Python)    |
| `PostgresExtractor`                               | Introspección directa a Information Schema de PG                 | Adaptador Infraestructura    |
| `CloudSyncService`                                | Cliente que envía/recibe `SchemaModel` a NestJS                  | Cliente API HTTP             |
| `DiagramsController`                              | Controlador NestJS que guarda los artefactos                     | Control / API                |
| `DiagramViewer`                                   | Componente React/Mermaid para visualización gráfica              | Presentación (UI)            |

### 6.3.2 Diagrama de actividades con objetos

```mermaid
flowchart TD
    A(["Inicio"]) --> B["Desktop App: Usuario pide extracción local"]
    B --> C["Sidecar: ConnectionManager recupera credencial"]
    C --> D["Sidecar: Extractor se conecta a BD Local"]
    D --> E["Sidecar: Transforma metadatos a SchemaModel"]
    E --> F["Tauri UI: Recibe SchemaModel y renderiza Mermaid"]
    F --> G{"¿El usuario sincroniza?"}
    G -- "Sí" --> H["CloudSyncService envía JSON a NestJS"]
    H --> I["DiagramsController lo inserta en DB de la nube"]
    G -- "No" --> J["Se preserva estado local"]
    I --> K(["Fin"])
    J --> K
```

### 6.3.3 Diagrama de secuencia

```mermaid
sequenceDiagram
    actor Usuario
    participant UI as Tauri Frontend
    participant SC as FastAPI Sidecar
    participant BD as BD del Usuario
    participant CL as NestJS Cloud API
    
    Usuario ->> UI: Ejecutar extracción (Conn_ID: 1)
    UI ->> SC: POST /local/extract { conn_id: 1 }
    SC ->> BD: Conexión nativa & SELECT Information Schema
    BD -->> SC: Metadatos crudos
    SC ->> SC: Transforma a SchemaModel.json
    SC -->> UI: 200 OK (SchemaModel)
    UI ->> UI: Renderiza diagrama con Mermaid
    Usuario ->> UI: Sincronizar proyecto a la nube
    UI ->> CL: POST /api/diagrams/sync { schema_model }
    Note over UI,CL: La conexión segura no viaja a la nube
    CL -->> UI: 201 Created
```

### 6.3.4 Diagrama de clases

```mermaid
classDiagram
    class SchemaModel {
        +entities: Entity[]
        +relationships: Relationship[]
    }
    class Entity {
        +name: String
        +attributes: Attribute[]
    }
    class Attribute {
        +name: String
        +type: String
        +isPrimaryKey: Boolean
    }
    class BaseExtractor {
        <<interface>>
        +extract(connString): SchemaModel
    }
    class PostgresExtractor
    class MySQLExtractor
    
    class SQLParser {
        +parseString(ddl: String): SchemaModel
    }

    SchemaModel "1" *-- "*" Entity
    Entity "1" *-- "*" Attribute
    BaseExtractor ..> SchemaModel : Produce
    BaseExtractor <|.. PostgresExtractor
    BaseExtractor <|.. MySQLExtractor
    SQLParser ..> SchemaModel : Produce
```

# 7. Conclusiones

1. La arquitectura del sistema FluxSQL demuestra ser viable y altamente segura, implementando políticas modernas de separación de dominios (Cloud vs Local).
2. El ERS valida la necesidad de un patrón *Sidecar* para habilitar la introspección profunda de bases de datos sin vulnerar políticas de IT empresariales ni exponer los puertos a internet.
3. El uso estandarizado del modelo `SchemaModel` proporciona la base perfecta para integrar otros lenguajes, motores y eventualmente agentes MCP o IA, sin tener que rediseñar el motor gráfico de React (Mermaid).

# 8. Recomendaciones

1. **Mantener Trazabilidad**: El diseño de la nube (NestJS) y del Sidecar (FastAPI) deben evolucionar de la mano respecto al DTO `SchemaModel` para evitar incompatibilidades durante la sincronización.
2. **Cobertura BDD**: Automatizar la verificación de los escenarios de seguridad descritos en BDD usando Cypress o Playwright durante los pipelines de integración.
3. **Optimización**: Asegurar que los extractores (PostgreSQL/MySQL) utilicen consultas eficientes en las vistas del sistema (`information_schema`) para evitar sobrecargar bases de datos en producción.

# 9. Bibliografia

1. Pressman, R. S., & Maxim, B. R. (2020). *Software Engineering: A Practitioner's Approach*.
2. FastAPI Official Documentation. (2026). *Building Python APIs with modern typing*.
3. NestJS Core Team. (2026). *A progressive Node.js framework for building scalable server-side applications*.
4. Tauri Studio. (2026). *Build smaller, faster, and more secure desktop applications*.

# 10. Webgrafia

- Repositorio del proyecto FluxSQL: `README.md` y estructura de directorios.
- Diagramado gráfico web: [Mermaid.js](https://mermaid.js.org/)
- Framework Frontend: [Next.js](https://nextjs.org/)
- Construcción Desktop: [Tauri](https://tauri.app/)

# 11. Historias de Usuario, Criterios y Escenarios BDD

A continuación se definen los escenarios utilizando lenguaje Gherkin orientados al núcleo híbrido de FluxSQL.

## HU-01 Extracción local segura de esquemas de BD

**Como** Ingeniero de Datos, **quiero** conectar la aplicación de escritorio a mi BD local **para** extraer su estructura gráfica sin revelar mis credenciales a internet.

**CA-01.1:** Ejecución restringida al entorno Sidecar.

- **Escenario 01:** **Dado** que el usuario ingresa su usuario y contraseña, **cuando** el Sidecar intenta la extracción, **entonces** los metadatos de estructura (tablas, columnas) se extraen exitosamente.
- **Escenario 02:** **Dado** un `SchemaModel` ya generado localmente, **cuando** la aplicación Desktop se sincroniza con el Cloud API, **entonces** el payload HTTPS enviado no contiene claves ni credenciales en absoluto.

**CA-01.2:** Soporte de motores relacionales.

- **Escenario 03:** **Dado** que se selecciona el motor MySQL, **cuando** el Sidecar es invocado, **entonces** utiliza el extractor y driver compatible para MySQL.
- **Escenario 04:** **Dado** un servidor inaccesible o apagado, **cuando** se ejecuta la conexión, **entonces** el Sidecar atrapa el timeout y el frontend muestra un error legible sin corromperse.

## HU-02 Modelado dinámico mediante texto (DDL)

**Como** Desarrollador, **quiero** escribir comandos `CREATE TABLE` en la web **para** ver el diagrama ERD reaccionar en tiempo real.

**CA-02.1:** Parseo en tiempo real (Client-side).

- **Escenario 05:** **Dado** un editor de código DDL activo, **cuando** el usuario termina de escribir un comando SQL válido, **entonces** el diagrama Mermaid se actualiza visualmente en menos de 500ms.
- **Escenario 06:** **Dado** un error de sintaxis SQL en el editor, **cuando** el parser evalúa el texto, **entonces** el diagrama visual mantiene el estado previo y se resalta la línea con error.

## HU-03 Sincronización híbrida de proyectos

**Como** Team Lead, **quiero** poder ver en la nube los diagramas actualizados por mi equipo local **para** colaborar y comentar el diseño.

**CA-03.1:** Actualización de versiones en NestJS.

- **Escenario 07:** **Dado** un diagrama con el estado local modificado, **cuando** el usuario hace clic en "Sincronizar", **entonces** el API Cloud responde `201` guardando la nueva versión.
- **Escenario 08:** **Dado** un token de autenticación (JWT) vencido, **cuando** la Desktop App intenta sincronizar, **entonces** la operación falla con estado `401 Unauthorized` y se notifica al usuario.

| Historia | Escenarios | Objetivo Funcional |
|----------|------------|--------------------|
| HU-01 | 01-04 | Garantizar arquitectura Zero-Trust y uso de FastAPI Sidecar. |
| HU-02 | 05-06 | Validar el parseo cliente (Next.js/TS) e interactividad Mermaid. |
| HU-03 | 07-08 | Sincronización Cloud API (NestJS) con seguridad perimetral. |

---
*Fin del documento.*
