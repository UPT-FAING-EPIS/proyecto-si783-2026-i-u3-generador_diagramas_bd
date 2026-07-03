import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/backend/db'
import { skillCatalog, userSkills, users } from '@/lib/backend/db/schema'

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
  if (error || !user) return { error: NextResponse.json({ error: 'Invalid Fluxy Web session.' }, { status: 401 }) }

  const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
  if (!dbUser) return { error: NextResponse.json({ skills: [] }) }
  return { dbUser }
}

export async function GET(request: Request) {
  const auth = await getDbUser(request)
  if ('error' in auth) return auth.error

  const rows = await db
    .select({
      skillId: userSkills.skillId,
      installedVersion: userSkills.installedVersion,
      enabled: userSkills.enabled,
      updatedAt: userSkills.updatedAt,
    })
    .from(userSkills)
    .where(eq(userSkills.userId, auth.dbUser.id))

  return NextResponse.json({ skills: rows })
}

export async function POST(request: Request) {
  const auth = await getDbUser(request)
  if ('error' in auth) return auth.error

  const payload = await request.json().catch(() => ({}))
  const incoming = Array.isArray(payload.skills) ? payload.skills : []
  let synced = 0

  for (const item of incoming) {
    if (!item?.skillId) continue
    const [skill] = await db.select().from(skillCatalog).where(eq(skillCatalog.id, item.skillId)).limit(1)
    if (!skill) continue

    const [existing] = await db
      .select()
      .from(userSkills)
      .where(and(eq(userSkills.userId, auth.dbUser.id), eq(userSkills.skillId, item.skillId)))
      .limit(1)

    if (existing) {
      await db
        .update(userSkills)
        .set({
          enabled: item.enabled !== false,
          installedVersion: item.installedVersion ?? skill.version,
          updatedAt: new Date(),
        })
        .where(eq(userSkills.id, existing.id))
    } else {
      await db.insert(userSkills).values({
        userId: auth.dbUser.id,
        skillId: item.skillId,
        installedVersion: item.installedVersion ?? skill.version,
        enabled: item.enabled !== false,
        installSource: 'desktop-sync',
      })
    }
    synced += 1
  }

  return NextResponse.json({ ok: true, synced })
}
