import os

file_path = r"docs\formatos\FD03-Informe-Especificacion-Requerimientos.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replacement 1: 6.2.2 Inventario de Casos de Uso
target_622 = """### 6.2.2 Inventario de Casos de Uso (20 CUs)

Para abarcar exhaustivamente el sistema implementado en la arquitectura híbrida (Tauri, Next.js, NestJS y FastAPI), se han definido **20 Casos de Uso** reales agrupados por módulos funcionales.

#### Módulo I: Autenticación y Nube (NestJS API)"""

replacement_622 = """### 6.2.2 Diagrama de casos de uso

Para abarcar exhaustivamente el sistema implementado en la arquitectura híbrida (Tauri, Next.js, NestJS y FastAPI), se han definido **20 Casos de Uso** reales agrupados por módulos funcionales. El siguiente diagrama de casos de uso resume el alcance funcional completo del sistema:

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Usuario (Analista/DBA)" as User
actor "Sistema OS (Keyring)" as OS
actor "Agente IA (Codex)" as AI

package "Generador de Diagramas BD - FluxSQL" {
  usecase "CU-01: Iniciar Sesión" as UC1
  usecase "CU-02: Registrar Cuenta" as UC2
  usecase "CU-06: Sincronizar Diagrama" as UC6
  usecase "CU-10: Parsear DDL a Diagrama" as UC10
  usecase "CU-15: Exportar PNG/SVG" as UC15
  usecase "CU-19: Ejecutar Introspección Local" as UC19
  usecase "CU-20: Transformar a SchemaModel" as UC20
}

User --> UC1
User --> UC2
User --> UC6
User --> UC10
User --> UC15
User --> UC19

UC19 --> OS : "Lee Credenciales Cifradas"
UC19 ..> UC20 : <<include>>
AI --> UC20 : "Consume Esquema (MCP)"
@enduml
```

#### Módulo I: Autenticación y Nube (NestJS API)"""

content = content.replace(target_622, replacement_622)

# Replacement 2: 6.3.1 Análisis de objetos por caso de uso
# We'll just replace the whole 6.3 section until the end of the file or up to the next big header.
# Wait, let's just find the exact block for CU-01, CU-02, CU-03 and replace their Mermaid flowcharts with PlantUML.
import re

mermaid_cu01 = """```mermaid
flowchart LR
    Actor((Usuario)) --> Boundary[LoginForm]
    Boundary --> Control((AuthController))
    Control --> Entity1[(Usuario)]
```"""

plantuml_cu01 = """```plantuml
@startuml
left to right direction
actor "Usuario" as Actor
boundary "LoginForm" as Boundary
control "AuthController" as Control
entity "Usuario" as Entity1

Actor --> Boundary : 1. Ingresa credenciales
Boundary --> Control : 2. Envia auth request
Control --> Entity1 : 3. Valida y recupera perfil
@enduml
```"""

mermaid_cu02 = """```mermaid
flowchart LR
    Actor((Usuario)) --> Boundary[RegisterForm]
    Boundary --> Control((AuthController))
    Control --> Entity1[(Usuario)]
```"""

plantuml_cu02 = """```plantuml
@startuml
left to right direction
actor "Usuario" as Actor
boundary "RegisterForm" as Boundary
control "AuthController" as Control
entity "Usuario" as Entity1

Actor --> Boundary : 1. Llena datos
Boundary --> Control : 2. Envia registro
Control --> Entity1 : 3. Crea registro BD
@enduml
```"""

mermaid_cu03 = """```mermaid
flowchart LR
    Actor((Usuario)) --> Boundary[NavBar]
    Boundary --> Control((SessionManager))
    Control --> Entity1[(TokenStore)]
```"""

plantuml_cu03 = """```plantuml
@startuml
left to right direction
actor "Usuario" as Actor
boundary "NavBar" as Boundary
control "SessionManager" as Control
entity "TokenStore" as Entity1

Actor --> Boundary : 1. Clic cerrar sesion
Boundary --> Control : 2. Invoca logout
Control --> Entity1 : 3. Destruye JWT
@enduml
```"""

content = content.replace(mermaid_cu01, plantuml_cu01)
content = content.replace(mermaid_cu02, plantuml_cu02)
content = content.replace(mermaid_cu03, plantuml_cu03)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
