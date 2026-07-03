import { diagramsAPI, projectsAPI } from '@/lib/api/client';

export interface ProjectListItem {
  project: {
    id: string
    name: string
    description: string | null
    ownerId: string
    tags: string[] | null
    createdAt: Date
    updatedAt: Date
    deleted_at: Date | null
    isPublic: boolean
    shareAccess: 'view' | 'edit'
    sourceDatabase?: string | null
    lastSyncedAt?: Date | null
  }
  role: string
  members: { id: string; name: string }[]
}

function stripCloudSyncMarkers(description: string | null): string | null {
  if (!description) return null;

  const cleaned = description
    .split(/\r?\n/)
    .filter((line) => {
      const value = line.trim();
      return !value.startsWith('cloud_project_id:') && !value.startsWith('cloud_diagram_id:');
    })
    .join('\n')
    .trim();

  return cleaned || null;
}

export async function getProjectsByUser(): Promise<ProjectListItem[]> {
  try {
    const projects = await projectsAPI.list();
    return Promise.all(projects.map(async (p) => {
      const diagrams = await diagramsAPI.listByProject(String(p.id)).catch(() => []);
      const firstDiagram = diagrams[0];
      const isCloudProject = Boolean(
        p.is_public
        || p.description?.includes('cloud_project_id:')
        || firstDiagram?.source_database?.startsWith('cloud_diagram_id:')
      );
      return {
        project: {
          id: String(p.id),
          name: p.name,
          description: stripCloudSyncMarkers(p.description),
          ownerId: 'local-user',
          tags: [],
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at ?? p.created_at),
          deleted_at: p.deleted_at ? new Date(p.deleted_at) : null,
          isPublic: isCloudProject,
          shareAccess: p.share_access,
          sourceDatabase: firstDiagram?.source_database?.startsWith('cloud_diagram_id:') ? null : firstDiagram?.source_database ?? null,
          lastSyncedAt: firstDiagram?.last_synced_at ? new Date(firstDiagram.last_synced_at) : null,
        },
        role: 'owner',
        members: [{ id: 'local-user', name: 'Usuario Local' }]
      };
    }));
  } catch (error) {
    console.error('Error fetching projects via API:', error);
    // Para modo local sin el backend corriendo, retornar un arreglo vacío en lugar de romper
    throw error instanceof Error ? error : new Error('No se pudieron cargar los proyectos.');
  }
}
