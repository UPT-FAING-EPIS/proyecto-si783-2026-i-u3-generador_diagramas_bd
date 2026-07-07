import os
import re

file_path = r"docs\formatos\FD03-Informe-Especificacion-Requerimientos.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update general use case diagram to include all 20 use cases
use_case_plantuml = """```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Usuario (Analista/DBA)" as User
actor "Sistema OS (Keyring)" as OS
actor "Agente IA (Codex)" as AI

package "Generador de Diagramas BD - FluxSQL" {
  usecase "CU-01: Iniciar Sesión" as UC1
  usecase "CU-02: Registrar Cuenta" as UC2
  usecase "CU-03: Cerrar Sesión" as UC3
  usecase "CU-04: Galería Proyectos" as UC4
  usecase "CU-05: Crear Proyecto" as UC5
  usecase "CU-06: Sync Push" as UC6
  usecase "CU-07: Sync Pull" as UC7
  usecase "CU-08: Eliminar Proyecto" as UC8
  usecase "CU-09: DDL Manual" as UC9
  usecase "CU-10: Parsear DDL" as UC10
  usecase "CU-11: JSON Schema" as UC11
  usecase "CU-12: Parsear JSON" as UC12
  usecase "CU-13: Zoom Lienzo" as UC13
  usecase "CU-14: Paneo Lienzo" as UC14
  usecase "CU-15: Exportar PNG" as UC15
  usecase "CU-16: Exportar SVG" as UC16
  usecase "CU-17: Exportar MMD" as UC17
  usecase "CU-18: Guardar Credenciales" as UC18
  usecase "CU-19: Introspección BD" as UC19
  usecase "CU-20: Mapeo SchemaModel" as UC20
}

User --> UC1
User --> UC2
User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7
User --> UC8
User --> UC9
User --> UC11
User --> UC13
User --> UC14
User --> UC15
User --> UC16
User --> UC17
User --> UC18
User --> UC19

UC19 --> OS : "Lee Credenciales Cifradas"
UC9 ..> UC10 : <<include>>
UC11 ..> UC12 : <<include>>
UC19 ..> UC20 : <<include>>
AI --> UC20 : "Consume Esquema (MCP)"
@enduml
```"""

# Replace the current plantuml block inside 6.2.2 with the new one
content = re.sub(r"```plantuml\n@startuml\nleft to right direction\nskinparam packageStyle rectangle.*?@enduml\n```", use_case_plantuml, content, flags=re.DOTALL)

# 2. Convert all mermaid robustness diagrams to plantuml
def replace_mermaid(match):
    mermaid_code = match.group(0)
    
    # Extract names safely, if not found use generic
    actor_match = re.search(r'Actor\(\((.*?)\)\)', mermaid_code)
    actor = actor_match.group(1) if actor_match else "Usuario"
    
    boundary_match = re.search(r'Boundary\[(.*?)\]', mermaid_code)
    boundary = boundary_match.group(1) if boundary_match else "UI"
    
    control_match = re.search(r'Control\(\((.*?)\)\)', mermaid_code)
    control = control_match.group(1) if control_match else "Controller"
    
    entities = re.findall(r'Entity\d+\[\((.*?)\)\]', mermaid_code)
    
    plantuml = "```plantuml\n@startuml\nleft to right direction\n"
    plantuml += f'actor "{actor}" as Actor\n'
    plantuml += f'boundary "{boundary}" as Boundary\n'
    plantuml += f'control "{control}" as Control\n'
    
    for i, entity in enumerate(entities, 1):
        plantuml += f'entity "{entity}" as Entity{i}\n'
        
    plantuml += "\nActor --> Boundary\nBoundary --> Control\n"
    
    for i, entity in enumerate(entities, 1):
        plantuml += f"Control --> Entity{i}\n"
        
    plantuml += "@enduml\n```"
    return plantuml

content = re.sub(r"```mermaid\nflowchart LR.*?```", replace_mermaid, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Actualización completada para los 20 diagramas.")
