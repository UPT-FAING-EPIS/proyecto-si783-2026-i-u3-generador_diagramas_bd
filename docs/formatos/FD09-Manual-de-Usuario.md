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

Manual de Usuario

Version *1.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Version | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | KHZM / JAVE | P. Cuadros Q. | Julio 2026 | Manual de uso para Web, Desktop, generador, editor y sincronizacion |

## INDICE GENERAL

1. [Introduccion](#1-introduccion)
2. [Requisitos](#2-requisitos)
3. [Acceso a FluxSQL Web](#3-acceso-a-fluxsql-web)
4. [Uso de FluxSQL Desktop](#4-uso-de-fluxsql-desktop)
5. [Gestion de Proyectos](#5-gestion-de-proyectos)
6. [Editor de Diagramas](#6-editor-de-diagramas)
7. [Conexion a Bases de Datos](#7-conexion-a-bases-de-datos)
8. [Generacion de Datos de Prueba](#8-generacion-de-datos-de-prueba)
9. [Versiones y Exportaciones](#9-versiones-y-exportaciones)
10. [Sincronizacion Cloud](#10-sincronizacion-cloud)
11. [Modulos Avanzados](#11-modulos-avanzados)
12. [Buenas Practicas y Solucion de Problemas](#12-buenas-practicas-y-solucion-de-problemas)

<div style="page-break-after: always; visibility: hidden">\pagebreak</div>

# Manual de Usuario

## 1. Introduccion

**FluxSQL** es una plataforma hibrida para crear, visualizar, documentar y sincronizar diagramas de bases de datos. El usuario puede trabajar desde la web para colaborar y visualizar proyectos, o desde la aplicacion Desktop para conectarse de forma segura a bases de datos locales mediante un sidecar FastAPI.

El sistema esta orientado a estudiantes, desarrolladores, administradores de base de datos y equipos tecnicos que necesitan documentar esquemas sin exponer credenciales en la nube.

## 2. Requisitos

### 2.1. Para FluxSQL Web

| Requisito | Detalle |
|---|---|
| Navegador | Chrome, Edge o Firefox actualizado. |
| Internet | Necesario para acceso web y sincronizacion. |
| Cuenta | Registro o inicio de sesion en la plataforma. |

### 2.2. Para FluxSQL Desktop

| Requisito | Detalle |
|---|---|
| Sistema operativo | Windows 10/11, Linux o macOS segun compilacion disponible. |
| Sidecar local | Se inicia junto con la aplicacion Desktop. |
| Motor de BD | PostgreSQL, MySQL, SQL Server, MongoDB, Cassandra o Neo4j segun conector. |
| Permisos | Acceso de red local al motor de base de datos. |

## 3. Acceso a FluxSQL Web

### 3.1. Iniciar sesion

1. Abrir la direccion web de FluxSQL.
2. Seleccionar **Login**.
3. Ingresar correo y credenciales.
4. Confirmar el ingreso al dashboard.

### 3.2. Registro

1. Seleccionar **Register**.
2. Completar los datos solicitados.
3. Confirmar la cuenta si el sistema lo requiere.
4. Ingresar al dashboard principal.

### 3.3. Pantallas disponibles

| Pantalla | Uso |
|---|---|
| Dashboard | Ver proyectos y acceder al editor. |
| Editor | Crear o modificar diagramas. |
| Analytics | Revisar actividad o metricas disponibles. |
| Profile | Revisar datos del usuario. |
| Skills | Consultar habilidades disponibles. |
| Agent Tools | Gestionar herramientas de agente cuando aplique. |
| Public Diagram | Visualizar diagramas compartidos por enlace. |
| Desktop Link | Enlazar Desktop con la cuenta Cloud. |

## 4. Uso de FluxSQL Desktop

### 4.1. Inicio de la aplicacion

1. Ejecutar FluxSQL Desktop.
2. Esperar a que el backend local este disponible.
3. Verificar que el dashboard cargue correctamente.
4. Si el backend no responde, reiniciar la aplicacion.

### 4.2. Pantallas principales Desktop

| Pantalla | Funcion |
|---|---|
| Dashboard | Gestion local de proyectos. |
| Connect | Crear y probar conexiones a bases de datos. |
| Diagrams/New | Crear diagramas nuevos. |
| Editor | Editar tablas, columnas y relaciones. |
| Generator | Generar datos sinteticos o exportarlos. |
| Analyzer | Analizar consultas y revisar metricas. |
| Account | Enlazar o desenlazar cuenta Cloud. |
| MCP | Consultar configuracion de integracion MCP. |
| Skills | Instalar o habilitar habilidades locales. |
| Agent Tools | Revisar memoria, permisos, aprobaciones y decisiones. |

## 5. Gestion de Proyectos

### 5.1. Crear proyecto

1. Ir al dashboard.
2. Seleccionar la opcion de nuevo proyecto.
3. Ingresar nombre y descripcion.
4. Guardar.
5. Abrir el proyecto en el editor.

### 5.2. Editar proyecto

1. Seleccionar el proyecto desde el dashboard.
2. Modificar nombre o descripcion.
3. Guardar los cambios.

### 5.3. Eliminar o restaurar

En Desktop, los proyectos pueden manejar borrado logico. Si un proyecto fue eliminado, puede restaurarse cuando la interfaz lo permita. La eliminacion permanente debe usarse con cuidado porque borra tambien diagramas y versiones asociadas.

## 6. Editor de Diagramas

### 6.1. Crear tablas

1. Abrir el editor.
2. Agregar una nueva tabla.
3. Asignar nombre de tabla.
4. Agregar columnas.
5. Marcar llaves primarias, foraneas, nulabilidad y tipos.

### 6.2. Crear relaciones

1. Seleccionar la columna origen.
2. Conectar con la columna destino.
3. Definir cardinalidad cuando corresponda.
4. Revisar que la relacion aparezca en el lienzo.

### 6.3. Dialectos soportados por el editor

| Dialecto | Uso |
|---|---|
| PostgreSQL | Generacion SQL con comillas dobles y tipos PostgreSQL. |
| MySQL | Generacion SQL con backticks y tipos MySQL. |
| SQL Server | Generacion SQL con corchetes y tipos SQL Server. |
| JSON | Exportacion estructurada de tablas y relaciones. |
| MongoDB | Generacion aproximada de esquemas Mongoose. |
| Neo4j | Generacion de nodos y relaciones Cypher. |

### 6.4. Guardar cambios

1. Revisar el diagrama visual.
2. Confirmar que las tablas tengan columnas.
3. Guardar el proyecto o diagrama.
4. Crear una version si el cambio es importante.

## 7. Conexion a Bases de Datos

### 7.1. Crear conexion local

1. Abrir la pantalla **Connect** en Desktop.
2. Seleccionar motor de base de datos.
3. Ingresar host, puerto, usuario, contrasena y base de datos.
4. Probar conexion.
5. Guardar si el resultado es correcto.

### 7.2. Motores considerados

| Motor | Uso principal |
|---|---|
| PostgreSQL | Introspeccion de tablas, columnas y relaciones. |
| MySQL | Introspeccion de esquemas relacionales. |
| SQL Server | Soporte relacional empresarial. |
| MongoDB | Lectura de estructuras NoSQL. |
| Cassandra | Soporte para modelos distribuidos. |
| Neo4j | Lectura de grafos y relaciones. |

### 7.3. Generar diagrama desde una base existente

1. Crear o seleccionar una conexion guardada.
2. Obtener el esquema.
3. Seleccionar tablas.
4. Ejecutar generacion de diagrama.
5. Revisar el resultado en el editor.
6. Guardar el diagrama localmente.

### 7.4. Seguridad de conexion

Las credenciales se usan solo en Desktop. La nube no recibe contrasenas ni cadenas de conexion. Al sincronizar, se envia solamente informacion segura como motor, ambiente, version y metadatos del diagrama.

## 8. Generacion de Datos de Prueba

### 8.1. Vista previa

1. Abrir **Generator**.
2. Seleccionar esquema o diagrama.
3. Configurar tablas y cantidad de registros.
4. Elegir locale, semilla o dominio si aplica.
5. Generar vista previa.

### 8.2. Exportar datos

1. Configurar tablas y reglas.
2. Seleccionar formato: SQL, CSV o JSON.
3. Ejecutar exportacion.
4. Descargar el archivo generado.

### 8.3. Insertar datos

1. Verificar conexion.
2. Confirmar ambiente: development, staging, production o unknown.
3. Revisar reglas de aprobacion.
4. Ejecutar insercion solo si el entorno es seguro.

Advertencia: en ambientes de produccion, se recomienda usar backup, sandbox y aprobacion humana antes de insertar datos.

## 9. Versiones y Exportaciones

### 9.1. Crear version

1. Abrir un proyecto con diagrama.
2. Realizar cambios en tablas o relaciones.
3. Seleccionar crear version.
4. Escribir un mensaje descriptivo.
5. Guardar.

### 9.2. Restaurar version

1. Abrir historial de versiones.
2. Seleccionar una version anterior.
3. Revisar contenido.
4. Restaurar si corresponde.

### 9.3. Exportaciones disponibles

| Formato | Descripcion |
|---|---|
| SQL PostgreSQL | Script compatible con PostgreSQL. |
| SQL MySQL | Script compatible con MySQL. |
| SQL Server | Script compatible con SQL Server. |
| JSON | Representacion estructurada para integraciones. |
| Mermaid | Diagrama textual/documental. |
| SVG/PNG | Imagen del diagrama cuando la interfaz lo permita. |

## 10. Sincronizacion Cloud

### 10.1. Enlazar cuenta

1. Abrir **Account** en Desktop.
2. Iniciar enlace de dispositivo.
3. Copiar o ingresar el codigo mostrado.
4. Completar verificacion en la web.
5. Confirmar estado `linked`.

### 10.2. Sincronizar proyectos

1. Confirmar que la cuenta este enlazada.
2. Ejecutar sincronizacion Cloud.
3. Revisar cantidad de proyectos y diagramas enviados o importados.
4. Resolver errores si existen.

### 10.3. Que datos se sincronizan

Se sincronizan:

- Proyectos.
- Diagramas.
- Versiones.
- SQL generado.
- Metadatos de conexion cloud-safe.
- Habilidades permitidas.

No se sincronizan:

- Contrasenas.
- Tokens locales.
- Backups.
- Dumps.
- Resultados privados de consultas.
- Cadenas de conexion completas.

## 11. Modulos Avanzados

### 11.1. Analyzer

Permite consultar informacion tecnica y analisis sobre motores o consultas cuando el conector lo soporte. Debe usarse con consultas seguras y sin exponer datos privados.

### 11.2. MCP

El modulo MCP muestra el endpoint local y configuracion para que herramientas compatibles puedan interactuar con el sidecar. Las respuestas deben limitarse a metadatos seguros.

### 11.3. Skills

Permite instalar o activar habilidades locales. Cada habilidad puede tener permisos para leer esquema, generar SQL o ejecutar acciones. Las acciones riesgosas pueden requerir aprobacion.

### 11.4. Agent Tools

Permite administrar memoria local, permisos, solicitudes de aprobacion, decisiones de esquema y guardas de ambiente.

## 12. Buenas Practicas y Solucion de Problemas

### 12.1. Buenas practicas

1. Nombrar proyectos y diagramas de forma clara.
2. Crear versiones antes de cambios importantes.
3. Usar conexiones guardadas solo en equipos confiables.
4. Evitar sincronizar informacion sensible dentro de nombres o comentarios.
5. Validar el SQL generado antes de aplicarlo en una base real.
6. Usar ambientes `development` o `staging` para pruebas de insercion.

### 12.2. Problemas frecuentes

| Problema | Causa probable | Solucion |
|---|---|---|
| El backend local no responde | Sidecar detenido o puerto no disponible | Reiniciar FluxSQL Desktop. |
| No conecta a la base | Host, puerto o credenciales incorrectas | Probar conexion y revisar acceso de red. |
| No aparecen tablas | Usuario sin permisos o base incorrecta | Verificar permisos de lectura de metadatos. |
| Error al sincronizar | Cuenta no enlazada o internet caido | Enlazar cuenta y reintentar. |
| Diagrama vacio | SQL invalido o esquema sin tablas seleccionadas | Revisar entrada y seleccionar tablas. |
| Insercion bloqueada | Politica de ambiente | Solicitar aprobacion o cambiar configuracion segura. |

### 12.3. Recomendacion final

FluxSQL debe utilizarse como una herramienta de documentacion, visualizacion y generacion controlada. La informacion sensible debe permanecer en el entorno local y solamente deben compartirse artefactos seguros en la nube.

---
*Fin del Documento.*
