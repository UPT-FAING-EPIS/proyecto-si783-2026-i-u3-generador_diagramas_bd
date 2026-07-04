<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

**Proyecto *Plataforma de Modelado y Sincronización de Diagramas (FluxSQL)***

Curso: *Base de Datos II*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna – Perú**

***2026***

</center>

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | P. Cuadros Q. | Marzo 2026 | Versión Original basada en FD01 |
| 2.0 | KHZM / JAVE | KHZM / JAVE | P. Cuadros Q. | Julio 2026 | Reescritura integral de la visión hacia FluxSQL Monorepo |

<br><br><br><br><br><br><br><br><br>

**Sistema *FluxSQL — Plataforma de Modelado y Sincronización de Diagramas***

**Documento de Visión**

**Versión *2.0***

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

**ÍNDICE GENERAL**

1. [Introducción](#1-introducción)
    1. Propósito
    2. Alcance
    3. Definiciones, Siglas y Abreviaturas
    4. Referencias
    5. Visión General
2. [Posicionamiento](#2-posicionamiento)
    1. Oportunidad de negocio
    2. Definición del problema
3. [Descripción de los interesados y usuarios](#3-descripción-de-los-interesados-y-usuarios)
    1. Resumen de los interesados
    2. Resumen de los usuarios
    3. Entorno de usuario
    4. Perfiles de los interesados
    5. Perfiles de los Usuarios
    6. Necesidades de los interesados y usuarios
4. [Vista General del Producto](#4-vista-general-del-producto)
    1. Perspectiva del producto
    2. Resumen de capacidades
    3. Suposiciones y dependencias
    4. Costos y precios
    5. Licenciamiento e instalación
5. [Características del producto](#5-características-del-producto)
6. [Restricciones](#6-restricciones)
7. [Rangos de calidad](#7-rangos-de-calidad)
8. [Precedencia y Prioridad](#8-precedencia-y-prioridad)
9. [Otros requerimientos del producto](#9-otros-requerimientos-del-producto)
10. [Conclusiones](#conclusiones)
11. [Recomendaciones](#recomendaciones)
12. [Bibliografía](#bibliografía)
13. [Webgrafía](#webgrafía)

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

**<u>Informe de Visión</u>**

## 1. **Introducción**

### 1.1 Propósito
El propósito del presente Documento de Visión es definir claramente las necesidades, características y objetivos de la plataforma **FluxSQL**. Este documento alinea la comprensión del ecosistema distribuido entre desarrolladores y usuarios, destacando cómo el enfoque Híbrido (Local y Nube) resuelve los fallos de las herramientas corporativas modernas en torno a la privacidad *Zero-Trust*.

### 1.2 Alcance
**FluxSQL** es una solución integral dividida en dominios. El alcance incluye:
- Una **Web App** (Next.js) que centraliza la visualización colaborativa, organización de proyectos y parser interactivo (Client-side) para transformar sentencias DDL en diagramas.
- Una **App de Escritorio** (Tauri + Python FastAPI Sidecar) encargada exclusivamente del trabajo nativo y "riesgoso": conexión local a motores (PostgreSQL, MySQL, SQLite), extracción de esquemas y cifrado de claves.
- Un **Cloud API** (NestJS) diseñado *stateless* para recibir diagramas serializados como JSON (`SchemaModel`) garantizando que jamás tocará las contraseñas.

El alcance **excluye** explícitamente herramientas bidireccionales (Forward Engineering que altere la BD) para limitar responsabilidades legales y destructivas sobre servidores de producción de los usuarios.

### 1.3 Definiciones, Siglas y Abreviaturas
- **ERD:** Diagrama Entidad-Relación. Representación abstracta conceptual.
- **Sidecar:** Patrón arquitectónico donde un proceso auxiliar (FastAPI) secunda la app principal (Tauri) tomando responsabilidad de redes complejas.
- **MCP:** Model Context Protocol. Un estándar emergente adoptado para agentes IA locales.
- **Zero-Trust:** Políticas de seguridad que asumen que la red (en este caso el Cloud API) no es de confianza para almacenar *Connection Strings*.

### 1.4 Referencias
- *FD01 - Informe de Factibilidad de FluxSQL* (Versión 2.0)
- Documentación de NestJS y Tauri.
- Metodologías de Desarrollo Universitario (Base de Datos II).

### 1.5 Visión General
Se describe la oportunidad de crear un modelador inofensivo pero colaborativo. A continuación, se definen los interesados, seguido de los perfiles y el modo de despliegue de las capas. Se identifican prioridades y rangos de calidad técnica.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 2. **Posicionamiento**

### 2.1 Oportunidad de negocio
Los clientes de base de datos pesados (DataGrip, DBeaver) hacen un gran trabajo en aislamiento, pero fracasan compartiendo resultados. Las herramientas web (dbdiagram.io) comparten bien, pero asustan a los directores IT al pedir credenciales expuestas en la nube.
FluxSQL separa los "artefactos" (seguros de compartir) de la "infraestructura" (insegura y local).

### 2.2 Definición del problema
| El problema de | la dicotomía histórica entre colaboración (Web) y seguridad (Desktop) en el diseño e introspección de Bases de Datos. |
| :--- | :--- |
| **Afecta a** | Administradores de Bases de datos, ingenieros y desarrolladores. |
| **El impacto de este problema es** | Dificulta sincronizar conocimiento entre equipos. Retrasa el diagnóstico de fallos relacionales y expone contraseñas en plataformas SaaS no auditadas. |
| **Una solución exitosa sería** | Una suite híbrida: un Sidecar nativo que lea las tablas, y un Cloud Backend estricto que solo recoja los dibujos de dichas tablas en un formato estructurado y abstracto. |

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 3. **Descripción de los interesados y usuarios**

### 3.1 Resumen de los interesados
| Nombre | Descripción | Responsabilidades |
| :--- | :--- | :--- |
| **Equipo de Desarrollo** | Kiara Zapana y Jefferson Vargas | Construir la Web App, el Sidecar de Extracción en Python y el NestJS API. |
| **Docente Asesor** | Mag. Patrick Cuadros Quiroga | Garantizar la validación rigurosa de entregables del curso Base de Datos II. |

### 3.2 Resumen de los usuarios
| Nombre | Descripción |
| :--- | :--- |
| **Administrador BD (DBA)** | Conoce y custodia las contraseñas. Usa la App Desktop (Tauri) para leer la estructura de forma blindada. |
| **Ingeniero Backend** | Construye esquemas DDL frecuentemente; necesita ver de manera gráfica los cambios de las migraciones. |
| **Desarrollador Frontend** | Entra a la Web App simplemente para leer el diagrama online que el DBA subió. |

### 3.3 Entorno de usuario
- **Navegador Web:** Chrome / Firefox / Edge para visualización y colaboración vía la app Next.js.
- **Escritorio Nativo:** Ejecutables Windows, Linux y Mac compilados en Rust con WebViews integrados.

### 3.4 Perfiles de los interesados
- **Propietarios (KIARA/JEFFERSON):** Estudiantes universitarios aplicando paradigmas avanzados (Zero-Trust, IPC, Microservicios API) en su proyecto académico.

### 3.5 Perfiles de los Usuarios
- **Usuario Técnico General:** Valora la velocidad por encima de todo. Disfruta un renderizado instantáneo (Debounce bajo de Mermaid) y aborrece los tiempos de compilación lentos de Java o Electron.

### 3.6 Necesidades de los interesados y usuarios
| Necesidad | Prioridad | Solución Propuesta (FluxSQL) |
| :--- | :---: | :--- |
| Extracción Privada | Alta | FastAPI Sidecar ejecutando queries locales directamente a PostgreSQL/MySQL y auto-destruyendo la conexión de memoria. |
| Acceso de Equipo | Alta | NestJS Cloud API guardando objetos JSON del diagrama vinculados a UUIDs de proyecto. |
| Fluidez de UI | Alta | Empleo de Rust Tauri (WebView nativo) y React Component Libraries sin empaquetar Chromium. |

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 4. **Vista General del Producto**

### 4.1 Perspectiva del producto
**FluxSQL** asume un ecosistema basado en un *Monorepo*. Su empaquetado final está descentralizado: el "core inteligente" son librerías puras en TypeScript (`@fluxsql/parsers`). La ejecución de la red reside en módulos encapsulados como el `backend-python` de escritorio y el `backend-api` de la nube. Todo convergiendo en diagramas de Mermaid universales.

### 4.2 Resumen de capacidades
| Capacidad | Descripción |
| :--- | :--- |
| **Conexiones Multi-Motor** | `Extractors` de Python para bases de datos SQL relacionales estándar. |
| **Parseo Client-Side** | Los scripts DDL ingresados en la web nunca viajan al backend; se parsean en el propio navegador. |
| **Sincronización API-REST** | Endpoints de subida (Push) y bajada (Pull) de artefactos resguardados bajo autenticación JWT. |
| **Exportación universal** | Soporte SVG y PNG interactivo de alta calidad. |

### 4.3 Suposiciones y dependencias
- **Suposición 1:** El Cloud API se mantendrá hospedado en servicios *Serverless* (Vercel) para reducir costos operativos.
- **Dependencias:** La compilación de Tauri depende del OS huésped (WebView2 en Windows, WebKit en Mac).

### 4.4 Costos y precios
El producto es un activo académico y de código abierto sin precio comercial de licencia.

### 4.5 Licenciamiento e instalación
El código en el monorepo y todos los subpaquetes serán liberados en GitHub bajo licencia **MIT**, favoreciendo auditorías de seguridad en la extracción de bases de datos.

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## 5. **Características del producto**

1. **Introspección Blindada:** Extrae *Information Schema* (PG/MySQL) ejecutando queries desde FastAPI y guardando las passwords en el llavero nativo del sistema (Keyring).
2. **Puente MCP (Model Context Protocol):** Permite en escritorio interactuar con futuros agentes de IA brindando un contexto abstracto sobre la arquitectura.
3. **Pizarra colaborativa en vivo:** Las visualizaciones web están listas para comentarios y versiones, todo impulsado por `Next.js App Router`.

## 6. **Restricciones**

- No incluye mutación de Bases de Datos (solo extracción). No es un cliente SQL genérico para ejecutar `INSERT`, `UPDATE` ni `DELETE`.
- En esta versión, las sincronizaciones colaborativas asumen conectividad HTTP constante a la API Cloud.

## 7. **Rangos de calidad**

- **Eficiencia Local:** El ejecutable de Tauri no superará un umbral operativo de 150MB en RAM (frente a los más de 500MB habituales de Electron).
- **Control de API Estricto:** La nube debe rechazar activamente mediante controladores (Status 400) payloads que contengan cualquier llave o `connectionString`.

## 8. **Precedencia y Prioridad**

1. Fase Core (Lógica base TypeScript Parser y UI).
2. Fase Desktop (Conectividad Python FastAPI y envoltura Tauri).
3. Fase Cloud (Seguridad JWT, API NestJS y persistencia PostgreSQL).

## 9. **Otros requerimientos del producto**

- Documentación Exhaustiva: Generar flujos BDD, Arquitecturas UML (4+1), e Informes Ejecutivos (FD01-FD05).

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

## **Conclusiones**

El cambio de visión de **DBCanvas** hacia la madura plataforma distribuida **FluxSQL** consolida la ambición tecnológica de solventar la brecha entre la visualización colaborativa y la privacidad Zero-Trust. El proyecto es un ejercicio avanzado de ingeniería de software en curso que prepara para la gestión de productos empresariales reales.

## **Recomendaciones**

Alinear constantemente el objeto JSON intermediario `SchemaModel`. Si el Python Extractor genera propiedades que el Frontend UI desconoce, el diagrama Mermaid fracasará estrepitosamente.

## **Bibliografía**

- Cuadros Quiroga, Patrick. (2026). *Material del Curso de Base de Datos II*. Universidad Privada de Tacna.
- Documento: *FD01-Informe-Factibilidad*. (Versión 2.0).

## **Webgrafía**

- NestJS Documentation. (2026). "A progressive Node.js framework".
- Tauri. (2026). "Build smaller, faster, and more secure desktop applications".
- FastAPI. (2026). "High performance web framework".

---
*Fin del Documento.*
