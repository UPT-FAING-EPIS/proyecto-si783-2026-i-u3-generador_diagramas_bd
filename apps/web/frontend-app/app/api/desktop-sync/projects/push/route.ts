import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/backend/db'
import { collaborators, diagrams, projects, users } from '@/lib/backend/db/schema'

async function getDbUser(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : ''
  if (!token) return { error: NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 }) }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return { error: NextResponse.json({ error: 'Invalid FluxSQL Web session.' }, { status: 401 }) }

  const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
  if (!dbUser) return { error: NextResponse.json({ error: 'FluxSQL user not found.' }, { status: 404 }) }
  return { dbUser }
}

function cleanDescription(value: unknown) {
  if (typeof value !== 'string') return null
  const cleaned = value
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim()
      return !trimmed.startsWith('cloud_project_id:') && !trimmed.startsWith('cloud_diagram_id:')
    })
    .join('\n')
    .trim()
  return cleaned || null
}

export async function POST(request: Request) {
  const auth = await getDbUser(request)
  if ('error' in auth) return auth.error

  const payload = await request.json().catch(() => ({}))
  const localProject = payload.project ?? {}
  const incomingDiagrams = Array.isArray(payload.diagrams) ? payload.diagrams : []
  const cloudProjectId = typeof payload.cloudProjectId === 'string' ? payload.cloudProjectId : null
  const now = new Date()

  const result = await db.transaction(async (tx) => {
    let projectId = cloudProjectId

    if (projectId) {
      const [access] = await tx
        .select({ id: projects.id })
        .from(projects)
        .innerJoin(collaborators, eq(collaborators.projectId, projects.id))
        .where(and(
          eq(projects.id, projectId),
          eq(collaborators.userId, auth.dbUser.id),
          isNull(projects.deleted_at),
        ))
        .limit(1)

      if (!access) projectId = null
    }

    if (projectId) {
      await tx
        .update(projects)
        .set({
          name: localProject.name || 'Proyecto Desktop',
          description: cleanDescription(localProject.description),
          engineFamily: localProject.engineFamily === 'nosql' ? 'nosql' : 'sql',
          updatedAt: now,
        })
        .where(eq(projects.id, projectId))
    } else {
      const [created] = await tx.insert(projects).values({
        name: localProject.name || 'Proyecto Desktop',
        description: cleanDescription(localProject.description),
        ownerId: auth.dbUser.id,
        engineFamily: localProject.engineFamily === 'nosql' ? 'nosql' : 'sql',
      }).returning({ id: projects.id })

      projectId = created.id
      await tx.insert(collaborators).values({
        projectId,
        userId: auth.dbUser.id,
        role: 'owner',
      })
    }

    const existingDiagrams = await tx.select().from(diagrams).where(eq(diagrams.projectId, projectId))
    const existingById = new Map(existingDiagrams.map((diagram) => [diagram.id, diagram]))
    const diagramIds: Array<{ localId: number | string | null; cloudDiagramId: string }> = []
    const touchedDiagramIds = new Set<string>()

    for (const incomingDiagram of incomingDiagrams) {
      const flowJson = incomingDiagram.flowJson && typeof incomingDiagram.flowJson === 'object'
        ? incomingDiagram.flowJson
        : { nodes: [], edges: [] }
      const requestedCloudId = typeof incomingDiagram.cloudDiagramId === 'string' ? incomingDiagram.cloudDiagramId : null
      const currentDiagram = requestedCloudId ? existingById.get(requestedCloudId) : null

      if (currentDiagram) {
        await tx
          .update(diagrams)
          .set({
            name: incomingDiagram.name || 'Diagrama Desktop',
            sourceCode: incomingDiagram.sourceCode ?? '',
            dialect: incomingDiagram.dialect ?? 'postgresql',
            flowJson,
            isPublic: true,
            shareAccess: 'view',
            updatedAt: now,
          })
          .where(eq(diagrams.id, currentDiagram.id))
        touchedDiagramIds.add(currentDiagram.id)
        diagramIds.push({ localId: incomingDiagram.localId ?? null, cloudDiagramId: currentDiagram.id })
      } else {
        const [createdDiagram] = await tx.insert(diagrams).values({
          projectId,
          name: incomingDiagram.name || 'Diagrama Desktop',
          sourceCode: incomingDiagram.sourceCode ?? '',
          dialect: incomingDiagram.dialect ?? 'postgresql',
          flowJson,
          isPublic: true,
          shareAccess: 'view',
        }).returning({ id: diagrams.id })
        touchedDiagramIds.add(createdDiagram.id)
        diagramIds.push({ localId: incomingDiagram.localId ?? null, cloudDiagramId: createdDiagram.id })
      }
    }

    for (const existingDiagram of existingDiagrams) {
      if (!touchedDiagramIds.has(existingDiagram.id)) {
        await tx.delete(diagrams).where(eq(diagrams.id, existingDiagram.id))
      }
    }

    return { projectId, diagramId: diagramIds[0]?.cloudDiagramId ?? null, diagramIds }
  })

  return NextResponse.json({ ok: true, ...result })
}
