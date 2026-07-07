<center>

![Logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERIA**

**Escuela Profesional de Ingenieria de Sistemas**

**Proyecto *Plataforma de Modelado y Sincronizacion de Diagramas (FluxSQL)***

Curso: *Base de Datos II*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna - Peru**

***2026***

</center>

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

Sistema *FluxSQL - Database Diagram Generator & Cloud Sync*

Estandar de Programacion

Version *1.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Version | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | KHZM / JAVE | P. Cuadros Q. | Julio 2026 | Definicion de estandares para Web, Cloud API, Desktop y Sidecar |

## INDICE GENERAL

1. [Introduccion](#1-introduccion)
2. [Objetivo](#2-objetivo)
3. [Alcance](#3-alcance)
4. [Stack Tecnologico](#4-stack-tecnologico)
5. [Estandares Generales](#5-estandares-generales)
6. [Estandar TypeScript y React](#6-estandar-typescript-y-react)
7. [Estandar NestJS Cloud API](#7-estandar-nestjs-cloud-api)
8. [Estandar Python FastAPI](#8-estandar-python-fastapi)
9. [Estandar de Base de Datos](#9-estandar-de-base-de-datos)
10. [Seguridad](#10-seguridad)
11. [Pruebas y Calidad](#11-pruebas-y-calidad)
12. [Control de Versiones](#12-control-de-versiones)

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

# Estandar de Programacion

## 1. Introduccion

El presente documento establece las reglas de codificacion para el desarrollo de **FluxSQL**, plataforma hibrida compuesta por una Web App, API Cloud, aplicacion Desktop, sidecar local y extensiones de integracion. El estandar busca asegurar legibilidad, mantenibilidad, seguridad y coherencia entre Kiara Zapana y Jefferson Vargas durante el desarrollo academico del proyecto.

## 2. Objetivo

Definir criterios de programacion para que los modulos de FluxSQL mantengan una arquitectura limpia, segura y verificable, evitando duplicidad innecesaria, exposicion de secretos, errores de sincronizacion y divergencias entre los contratos Cloud y Desktop.

## 3. Alcance

Aplica a:

- `apps/web/frontend-app`: interfaz web Next.js.
- `apps/web/backend-api`: API Cloud NestJS.
- `apps/desktop/frontend-app`: interfaz Desktop Next.js/Tauri.
- `apps/desktop/backend-python`: sidecar FastAPI, conectores, generadores, MCP y SQLite local.
- `apps/vscode-extension`: extension VS Code para diagramas.
- `packages/*`: paquetes compartidos y utilidades del monorepo.

## 4. Stack Tecnologico

| Capa | Tecnologia | Uso |
|---|---|---|
| Frontend Web | Next.js, React, TypeScript | Dashboard, editor y visualizacion colaborativa. |
| Frontend Desktop | Next.js, React, Tauri | Interfaz local y comunicacion con sidecar. |
| Cloud API | NestJS, TypeScript, Drizzle ORM | Proyectos, diagramas, versiones y telemetria. |
| Sidecar Local | Python, FastAPI, SQLAlchemy, Pydantic | Conexiones locales, introspeccion, generacion y seguridad. |
| Base Cloud | PostgreSQL | Persistencia colaborativa. |
| Base Local | SQLite | Persistencia privada del escritorio. |
| Visualizacion | React Flow, Mermaid | Lienzo interactivo y exportacion. |

## 5. Estandares Generales

### 5.1. Idioma y nombres

- El codigo fuente debe usar nombres tecnicos en ingles cuando formen parte del framework o API publica: `Project`, `Diagram`, `Version`, `FlowJson`.
- Los textos visibles al usuario pueden estar en espanol.
- Los nombres deben ser descriptivos y evitar abreviaturas ambiguas.
- Los archivos deben seguir la convencion del ecosistema:
  - React: `PascalCase.tsx` para componentes reutilizables.
  - TypeScript utilitario: `kebab-case.ts` o nombres existentes del modulo.
  - Python: `snake_case.py`.

### 5.2. Formato

- Usar indentacion de 2 espacios en TypeScript/React.
- Usar indentacion de 4 espacios en Python.
- Mantener lineas cortas y expresiones legibles.
- No mezclar cambios de formato masivo con cambios funcionales.
- Evitar comentarios obvios; documentar solamente reglas complejas o decisiones de seguridad.

### 5.3. Arquitectura

- Mantener separacion por capas: UI, cliente API, servicios, modelos, persistencia y conectores.
- No acceder directamente a la base de datos desde componentes de interfaz.
- No duplicar contratos entre Cloud y Desktop sin justificarlo.
- Usar DTOs, tipos TypeScript y modelos Pydantic para validar entradas.

## 6. Estandar TypeScript y React

### 6.1. Tipado

- Evitar `any`; usar `unknown`, interfaces o tipos especificos.
- Centralizar tipos compartidos del editor en archivos como `editor-schema.ts` y `flow-types.ts`.
- Validar objetos externos antes de asumir su forma.

Ejemplo esperado:

```ts
export type FlowJson = {
  nodes?: Node[]
  edges?: Edge[]
  viewport?: {
    x: number
    y: number
    zoom: number
  }
}
```

### 6.2. Componentes

- Los componentes deben tener una unica responsabilidad visual o de interaccion.
- La logica de llamadas HTTP debe residir en clientes API, no dentro del JSX principal.
- Los estados globales del editor deben ubicarse en stores o hooks definidos.
- Los formularios de conexion deben limpiar y validar campos antes de enviarlos al sidecar.

### 6.3. Editor visual

- El estado canonico del lienzo es `FlowJson`.
- Los nodos deben incluir `tableName` y `columns`.
- Las relaciones deben conservar `source`, `target`, handles y cardinalidad.
- Toda exportacion SQL debe partir del modelo visual validado.

### 6.4. Manejo de errores

- Mostrar mensajes seguros al usuario.
- No exponer tokens, contrasenas ni cadenas de conexion en errores.
- Capturar errores de red del sidecar y reintentar inicializacion del puerto cuando aplique.

## 7. Estandar NestJS Cloud API

### 7.1. Controladores

- Cada recurso debe tener su propio controlador: proyectos, diagramas, versiones, usuarios, telemetria.
- Las rutas deben ser REST y expresivas.
- Los controladores no deben contener logica de negocio extensa.

### 7.2. DTOs

- Todo `POST`, `PATCH` o sincronizacion debe recibir DTO.
- Los DTO Cloud no deben aceptar campos peligrosos como `password`, `connectionString`, `dump`, `backup` o resultados privados.
- La politica cloud-safe debe mantenerse visible y verificable.

### 7.3. Persistencia

- Usar Drizzle ORM para definir tablas y relaciones.
- Mantener `created_at` y `updated_at` con zona horaria.
- Usar UUID para identificadores Cloud.
- Definir restricciones explicitas para roles y unicidad.

## 8. Estandar Python FastAPI

### 8.1. Modelos Pydantic

- Toda entrada HTTP debe validarse con `BaseModel`.
- Los puertos deben limitarse al rango `1-65535`.
- Los modelos de respuesta seguros no deben incluir contrasenas.
- Usar enums para motores, ambientes y decisiones de politica.

### 8.2. SQLAlchemy y SQLite

- Los modelos locales deben estar separados de los esquemas Pydantic.
- Las contrasenas deben guardarse cifradas.
- Los campos JSON en SQLite deben serializarse como texto y validarse al leer.

### 8.3. Conectores

- Cada motor debe encapsular su propia logica de conexion.
- Las consultas de introspeccion deben ser de solo lectura.
- No se debe ejecutar SQL arbitrario para extraer metadatos.
- Las operaciones de insercion o escritura requieren politica de ambiente y aprobacion si corresponde.

## 9. Estandar de Base de Datos

### 9.1. Nombres

- Tablas en plural y snake_case: `diagram_versions`, `sync_queue`, `audit_logs`.
- Columnas en snake_case: `created_at`, `updated_at`, `project_id`.
- Identificadores Cloud en UUID.
- Identificadores locales en enteros autoincrementales cuando pertenezcan a SQLite.

### 9.2. Fechas

- En Cloud, usar timestamps con zona horaria.
- En Desktop, conservar `datetime` local/UTC de forma consistente.
- Los DTOs deben serializar fechas como cadenas ISO cuando viajen por HTTP.

### 9.3. JSON

- `flow_json`, `schema_json`, `snapshots_json`, `payload_json` y `details_json` deben contener JSON valido.
- El JSON de diagramas debe preservar `nodes`, `edges` y `viewport`.
- No se deben incluir secretos dentro de campos JSON.

## 10. Seguridad

### 10.1. Principio Zero-Trust

FluxSQL asume que la nube no debe conocer datos privados de conexion. Por ello:

- Las credenciales viven solo en Desktop.
- La API Cloud solo acepta metadatos de diagramas y SQL generado.
- El sidecar local es responsable de conectarse a motores externos.
- La sincronizacion debe usar payloads cloud-safe.

### 10.2. Secretos

- No registrar contrasenas en consola.
- No guardar `.env`, tokens, llaves privadas ni backups en Git.
- En respuestas publicas, usar hosts enmascarados y banderas como `has_credentials`.
- Los errores deben explicar el problema sin revelar valores sensibles.

### 10.3. Operaciones riesgosas

- Toda escritura directa en base externa debe pasar por una politica de ambiente.
- Produccion debe requerir backup, sandbox o aprobacion humana cuando se configure.
- Los logs de auditoria deben registrar decision, accion y resultado.

## 11. Pruebas y Calidad

| Tipo | Herramienta / enfoque | Criterio |
|---|---|---|
| Frontend | Tests/e2e cuando aplique | Flujos de editor, dashboard y sincronizacion. |
| Backend Cloud | Pruebas unitarias o integracion | DTOs, controladores, seguridad cloud-safe. |
| Sidecar | Pruebas de conectores y modelos | Validacion Pydantic, introspeccion y generacion. |
| Documentacion | Revision manual | Coherencia con FD y contratos reales. |

Reglas:

1. Probar rutas criticas despues de modificar contratos.
2. Validar que el editor siga cargando diagramas existentes.
3. Verificar que la nube rechace artefactos no seguros.
4. Mantener fixtures sin datos reales ni credenciales.

## 12. Control de Versiones

- Trabajar en ramas descriptivas cuando se implementen funcionalidades.
- Mantener `main` estable.
- Los commits deben describir el cambio en imperativo o resumen claro.
- No revertir cambios ajenos sin coordinacion.
- Antes de publicar, revisar `git status` y confirmar que no existan secretos.

### 12.1. Criterios de aceptacion de codigo

Un cambio se considera aceptable cuando:

- Respeta la arquitectura hibrida Cloud/Desktop.
- No rompe contratos existentes.
- No expone secretos.
- Incluye validacion de entrada.
- Mantiene nombres y formato consistentes.
- Cuenta con pruebas o verificacion proporcional al riesgo.

---
*Fin del Documento.*
