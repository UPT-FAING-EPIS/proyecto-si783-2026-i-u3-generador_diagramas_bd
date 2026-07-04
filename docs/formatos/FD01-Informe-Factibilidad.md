<center>

![Logo UPT](./media/logo-upt.png)

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

Sistema *FluxSQL — Database Diagram Generator & Cloud Sync*

Informe de Factibilidad

Versión *2.0*

| CONTROL DE VERSIONES |           |              |               |            |                 |
|:--------------------:|:----------|:-------------|:--------------|:-----------|:----------------|
|       Versión        | Hecha por | Revisada por | Aprobada por  | Fecha      | Motivo          |
|         1.0          | KHZM / JAVE |            | P. Cuadros Q. | Marzo 2026 | Versión Original (DBCanvas) |
|         2.0          | KHZM / JAVE | KHZM / JAVE| P. Cuadros Q. | Julio 2026 | Actualización de stack a Arquitectura Híbrida FluxSQL |

## ÍNDICE GENERAL

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Riesgos](#2-riesgos)
3. [Análisis de la Situación Actual](#3-análisis-de-la-situación-actual)
4. [Estudio de Factibilidad](#4-estudio-de-factibilidad)
    - 4.1 [Factibilidad Técnica](#41-factibilidad-técnica)
    - 4.2 [Factibilidad Económica](#42-factibilidad-económica)
    - 4.3 [Factibilidad Operativa](#43-factibilidad-operativa)
    - 4.4 [Factibilidad Legal](#44-factibilidad-legal)
    - 4.5 [Factibilidad Social](#45-factibilidad-social)
    - 4.6 [Factibilidad Ambiental](#46-factibilidad-ambiental)
5. [Análisis Financiero](#5-análisis-financiero)
6. [Conclusiones](#6-conclusiones)

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

# Informe de Factibilidad

## 1. Descripción del Proyecto

### 1.1. Nombre del Proyecto

**FluxSQL — Plataforma de Modelado y Sincronización de Diagramas**
Herramienta híbrida (Monorepo Web + Desktop) con arquitectura *Zero-Trust* para generar diagramas ERD automáticamente a partir de bases de datos locales y centralizar la documentación en la nube.

### 1.2. Duración del Proyecto

| Elemento | Detalle |
| :-- | :-- |
| Fecha de inicio | Marzo 2026 |
| Fecha de término estimada | Julio 2026 |
| Metodología | Desarrollo iterativo e incremental basado en BDD |

#### Distribución de Fases (Hitos)

| Hito | Descripción |
| :-- | :-- |
| **v1.0** | Setup de Monorepo y herramientas cliente (Parsers TypeScript) |
| **v2.0** | Integración del Sidecar local (FastAPI Python) para extracción segura |
| **v3.0** | Sistema Cloud (NestJS + PostgreSQL) para persistencia e identidades |
| **v4.0** | Empaquetado multiplataforma (Tauri Rust) e integración continua (CI/CD) |

### 1.3. Descripción

**FluxSQL** es una suite de herramientas diseñada para arquitectos de software, administradores de bases de datos (DBA) y desarrolladores que necesitan visualizar y compartir el esquema de sus bases de datos sin comprometer las credenciales de conexión corporativas. 

El proyecto resuelve un dilema histórico entre herramientas locales aisladas y plataformas SaaS inseguras, presentando una solución **Híbrida**:

- **FluxSQL Desktop (Tauri + Rust + Python FastAPI):** Opera localmente extrayendo metadatos (`Information Schema`) mediante un *Sidecar* seguro que no se comunica con internet, protegiendo llaves, hosts y passwords.
- **FluxSQL Cloud (Next.js + NestJS):** Centraliza y versiona objetos JSON estructurados (`SchemaModel`) que viajan de forma segura desde el cliente de escritorio para permitir la colaboración visual en equipo sin requerir instalación.

**Características principales:**
- **Zero-Trust:** El API Cloud rechaza intrínsecamente recibir cadenas de conexión. Todo el análisis ocurre localmente.
- **Renderizado Dinámico:** Diagramas dibujados interactivamente usando aceleración web con Mermaid.js.
- **Soporte Multi-motor:** Compatible nativamente con PostgreSQL, MySQL y SQLite vía librerías maduras de Python (psycopg2, pymysql).
- **Consumo Mínimo:** A diferencia de Electron, la aplicación Desktop utiliza Tauri, manteniendo el uso de memoria por debajo de los 150MB.

### 1.4. Objetivos

#### 1.4.1. Objetivo General

Construir una plataforma distribuida en monorepo que automatice la documentación visual de bases de datos relacionales, proporcionando un entorno local seguro para la extracción de metadatos (Tauri + Python) y un entorno web para su colaboración en equipo (NestJS + Next.js).

#### 1.4.2. Objetivos Específicos

- **Módulo Cliente:** Implementar parsers puros en TypeScript capaces de convertir SQL DDL en objetos estructurados.
- **Módulo Local (Sidecar):** Desarrollar un servicio en FastAPI (Python) que recupere la estructura relacional local sin transmitir los datos de la tabla.
- **Módulo Nube:** Desplegar una API REST segura en NestJS para la gestión de tokens JWT y versionado de proyectos.
- **Empaquetado:** Distribuir binarios estáticos a través de Tauri (Rust) minimizando las dependencias del usuario final.

## 2. Riesgos

| Riesgo | Probabilidad | Impacto | Estrategia de Mitigación |
| :-- | :--: | :--: | :-- |
| **Puertos ocupados localmente:** El Sidecar FastAPI necesita un puerto libre. | Alta | Alto | Asignación dinámica de puertos desde Tauri en el inicio; paso de variables de entorno al proceso Python. |
| **Rendimiento de dibujado Mermaid:** Un ERD masivo (> 300 tablas) congela el DOM de React. | Media | Alto | Implementar *debounce* estricto y renderización virtualizada. Limitar auto-render en bases inmensas. |
| **Vulnerabilidad de inyección SQL (Local):** | Baja | Crítico | El Sidecar no admite parámetros arbitrarios. Únicamente ejecuta queries fijos parametrizados (PRAGMA y vistas de sistema). |
| **Interoperabilidad DDL:** Discrepancias entre cómo PG y MySQL exponen llaves foráneas. | Alta | Medio | Estandarizar la salida Python al objeto agnóstico `SchemaModel.json`. |

## 3. Análisis de la Situación Actual

### 3.1. Planteamiento del Problema

Documentar arquitecturas de datos en la actualidad implica realizar ingeniería inversa con clientes SQL pesados (DBeaver, DataGrip) y redibujar el esquema manualmente en herramientas genéricas (Lucidchart, Draw.io). Cuando ocurre un parche o migración, la imagen estática queda obsoleta.

A su vez, soluciones web modernas (dbdiagram.io) automatizan el flujo, pero solicitan al desarrollador ingresar su **cadena de conexión de producción** en su servidor web. Esto es prohibido por el 90% de los departamentos de IT bajo políticas *Zero-Trust*.

**FluxSQL** nace para cubrir ese vacío: ofrece la comodidad de un SaaS colaborativo en Next.js, pero delega el "trabajo sucio y riesgoso" a un ejecutable compilado nativo (Tauri) que corre protegido detrás del firewall de la empresa.

### 3.2. Consideraciones de Hardware y Software

| Componente | Desarrollo (Monorepo) | Producción (Desktop Local) |
| :-- | :-- | :-- |
| CPU | 4-Core 2.5 GHz+ | Dual-core estándar |
| RAM | 8 GB mínimo (IDE + Docker) | 150 MB - 300 MB |
| Sistema OS | Ubuntu 22.04 LTS / Win 11 | Windows 10+ / Linux / macOS |
| Backend | Node 20+, Rust, Python 3.10+ | Ninguno (Binario Empaquetado) |

## 4. Estudio de Factibilidad

### 4.1. Factibilidad Técnica

La arquitectura híbrida de **FluxSQL** descentraliza la carga técnica y se basa en ecosistemas maduros:

| Componente | Tecnología | Factibilidad |
| :-- | :-- | :--: |
| UI Colaborativa Web | React + Next.js (TypeScript) | ✅ Alta |
| Backend API | NestJS (TypeScript) + PostgreSQL Cloud | ✅ Alta |
| Envoltura Nativa | Tauri (Rust) + WebView OS nativo | ✅ Alta |
| Extractor Nativo (Sidecar) | Python (FastAPI) + Drivers (`psycopg2`, `pymysql`) | ✅ Alta |
| Render Gráfico | Mermaid.js | ✅ Alta |
| CI/CD | GitHub Actions + Turborepo | ✅ Alta |

**Conclusión técnica:** Factible. El reemplazo de Electron por Tauri garantiza que el ejecutable de escritorio sea extremadamente ligero. Python proporciona el mejor soporte de conectores SQL del mercado. 

### 4.2. Factibilidad Económica

La inversión se mide principalmente en esfuerzo humano (desarrollo especializado híbrido).

**Costos del Ambiente Cloud y Licencias:**
Todas las tecnologías (Rust, Python, Next, Nest) operan bajo licencias Open Source (MIT, Apache). La API NestJS y Web Next.js son *stateless*, posibilitando el alojamiento gratuito en capas *Hobby* (Vercel, Supabase). Costo: S/. 0.00.

**Costos de Desarrollo:**

| Rol / Actividad | Horas Totales | Costo/Hora (S/.) | Costo Total (S/.) |
| :-- | :--: | :--: | :--: |
| Desarrollador Frontend (React/Tauri) | 200 h | 20.00 | 4,000.00 |
| Desarrollador Backend (Python/Nest) | 200 h | 20.00 | 4,000.00 |
| Pruebas y Aseguramiento E2E | 50 h | 10.00 | 500.00 |
| **Inversión Inicial Total** | | | **8,500.00** |

### 4.3. Factibilidad Operativa

**Stakeholders beneficiados:**
- **Equipos Técnicos:** Elimina horas hombre destinadas a dibujar y mantener sincronizadas imágenes de arquitecturas de bases de datos.
- **Ingenieros de Seguridad:** Permiten a sus equipos el uso de diagramadores sin tener que hacer túneles VPN arriesgados.

**Adopción:** Alta. Los usuarios no requieren dependencias en la nube para usar la versión local; el instalador incluye todo lo necesario.

### 4.4. Factibilidad Legal

Al ejecutarse el motor de extracción y parseo localmente, FluxSQL evita el almacenamiento o tránsito transfronterizo de datos personales y sensibles corporativos. Cumple íntegramente con:
- **GDPR** (General Data Protection Regulation).
- **Ley N° 29733** de Protección de Datos Personales del Perú.
Todo el código propio se licenciará bajo **MIT License**.

### 4.5. Factibilidad Social

Permite a entidades académicas y pequeñas empresas formalizar su documentación sin la barrera de entrada que suponen herramientas corporativas de miles de dólares por licencia anual. Ayuda a estudiantes del curso **Base de Datos II** a visualizar normalización dinámicamente.

### 4.6. Factibilidad Ambiental

La decisión arquitectónica de utilizar **Tauri** (Rust) sobre tecnologías como Electron y contenedores pesados ahorra hasta un 80% de consumo de memoria RAM y CPU en tiempo de reposo, contribuyendo a la disminución de la huella de carbono de los equipos ofimáticos diarios. A su vez, centralizar metadatos en un JSON ligero ahorra transferencias masivas de red y almacenamiento cloud innecesario.

## 5. Análisis Financiero

Considerando un mercado hipotético B2B de ahorro de tiempo.

- **Inversión Inicial:** S/. 8,500.00
- **Ahorro operativo por adopción en 3 equipos/año:** ~250 horas rediseñando diagramas. Valorizado en S/. 5,000 anuales.
- **Mantenimiento Técnico Cloud (Hobby + DB):** S/. 400.00 anuales.

| Periodo | Flujo Neto (S/.) |
| :--: | :--: |
| Año 0 | -8,500.00 |
| Año 1 | +4,600.00 |
| Año 2 | +4,600.00 |
| Año 3 | +4,600.00 |

*Valor Actual Neto (VAN) al 12%: S/. 2,548.43 (Rentable).*

## 6. Conclusiones

La reconstrucción integral del proyecto **FluxSQL** bajo el formato híbrido Monorepo (Tauri + Python + NestJS + Next.js) demuestra ser completamente **Factible y Viable**. 
Técnicamente supera las debilidades arquitectónicas primigenias de herramientas pesadas y resuelve el problema legal de privacidad, convirtiéndose en el estándar óptimo de documentación as a code para bases de datos relacionales empresariales.

---
*Fin del Documento.*
