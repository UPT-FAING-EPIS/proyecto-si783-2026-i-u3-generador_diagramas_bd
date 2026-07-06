'use client'

import { useCallback, useEffect, useState } from 'react'
import { open } from '@tauri-apps/plugin-shell'
import { Cloud, Copy, ExternalLink, LogOut, Monitor, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { syncAPI, type DeviceLinkStart } from '@/lib/api/client'

export default function AccountPage() {
  const fallbackUrl = 'https://fluxsql.sytes.net/desktop-link'
  const [deviceLink, setDeviceLink] = useState<DeviceLinkStart | null>(null)
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void syncAPI.account()
        .then((account) => {
          if (account.linked && account.user_email) {
            setLinkedEmail(account.user_email)
          }
        })
        .catch((cause) => console.error('Error loading cloud account:', cause))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function startLink() {
    setError(null)
    setMessage(null)

    try {
      const link = await syncAPI.startDeviceLink()
      setDeviceLink(link)
      await open(link.verification_url)
      setMessage('Abrimos la pagina de enlace en FluxSQL Web. Confirma la sesion ahi y Desktop quedara sincronizado.')
    } catch (err) {
      console.error('Error starting device link:', err)
      setError(err instanceof Error ? err.message : 'No pude iniciar el enlace con FluxSQL Web.')
    }
  }

  async function copyLoginUrl() {
    setError(null)
    try {
      await navigator.clipboard?.writeText(deviceLink?.verification_url ?? fallbackUrl)
      setMessage('URL copiada. Abrela en tu navegador para validar este Desktop.')
    } catch (err) {
      console.error('Error copying login URL:', err)
      setError('No pude copiar la URL automaticamente. Seleccionala manualmente desde el recuadro.')
    }
  }

  const refreshAccount = useCallback(async () => {
    setError(null)
    try {
      const account = await syncAPI.account()
      if (account.linked && account.user_email) {
        setLinkedEmail(account.user_email)
        setDeviceLink(null)
        await syncAPI.syncCloud().catch(() => null)
        setMessage(`Desktop sincronizado con ${account.user_email}. Ya actualizamos tus diagramas y skills.`)
        return true
      }
      return false
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude consultar la cuenta enlazada.')
      return false
    }
  }, [])

  const checkStatus = useCallback(async () => {
    if (!deviceLink) {
      await refreshAccount()
      return
    }
    setError(null)
    try {
      const status = await syncAPI.deviceStatus(deviceLink.device_code)
      if (status.status === 'linked') {
        setLinkedEmail(status.user_email ?? 'cuenta FluxSQL')
        setDeviceLink(null)
        await syncAPI.syncCloud().catch(() => null)
        setMessage(`Desktop sincronizado con ${status.user_email ?? 'tu cuenta FluxSQL'}. Ya actualizamos tus diagramas y skills.`)
      } else {
        const accountLinked = await refreshAccount()
        if (!accountLinked) setMessage('Todavia pendiente. Confirma la sesion en la pagina de enlace.')
      }
    } catch (err) {
      const accountLinked = await refreshAccount()
      if (!accountLinked) setError(err instanceof Error ? err.message : 'No pude consultar el estado del enlace.')
    }
  }, [deviceLink, refreshAccount])

  useEffect(() => {
    if (!deviceLink) return
    const interval = window.setInterval(() => {
      void checkStatus()
    }, Math.max(2, deviceLink.poll_interval) * 1000)
    return () => window.clearInterval(interval)
  }, [checkStatus, deviceLink])

  async function syncNow() {
    setError(null)
    setMessage(null)
    setIsSyncing(true)
    try {
      const result = await syncAPI.syncCloud()
      setMessage(`Sincronizacion completa: ${result.pushed_projects} proyectos enviados, ${result.pushed_diagrams} diagramas enviados, ${result.projects_imported} proyectos importados y ${result.diagrams_imported} diagramas importados.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude sincronizar los diagramas desde Web.')
    } finally {
      setIsSyncing(false)
    }
  }

  async function unlinkAccount() {
    setError(null)
    setMessage(null)
    try {
      await syncAPI.unlinkAccount()
      setLinkedEmail(null)
      setDeviceLink(null)
      setMessage('Cuenta desvinculada correctamente.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude desvincular la cuenta.')
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DashboardSidebar userName="Usuario Local" userAvatarUrl={null} />
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <section className="w-full max-w-3xl rounded-lg border border-border bg-card text-card-foreground p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Cuenta y sincronizacion</h1>
              <p className="text-sm text-muted-foreground">Conecta Desktop con FluxSQL Web sin mover tus credenciales locales.</p>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{linkedEmail ? 'Desktop enlazado' : 'Enlazar este Desktop'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {linkedEmail ? `Cuenta: ${linkedEmail}` : 'Genera un codigo, valida tu cuenta en Web y vuelve a Desktop sincronizado.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {linkedEmail ? (
                  <Button onClick={syncNow} disabled={isSyncing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sincronizar
                  </Button>
                ) : (
                  <Button onClick={startLink}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {deviceLink ? 'Generar nuevo codigo' : 'Enlazar Desktop'}
                  </Button>
                )}
                {deviceLink && (
                  <Button variant="outline" onClick={checkStatus}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verificar
                  </Button>
                )}
                {linkedEmail && (
                  <Button variant="outline" onClick={unlinkAccount} className="text-destructive hover:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    Salir
                  </Button>
                )}
              </div>
            </div>
            {deviceLink && (
              <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-center">
                <div className="rounded-lg border border-border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Codigo</p>
                  <p className="mt-1 font-mono text-lg font-semibold">{deviceLink.user_code}</p>
                </div>
                <code className="overflow-x-auto rounded-lg border border-border bg-card px-3 py-3 text-xs text-muted-foreground">
                  {deviceLink.verification_url}
                </code>
                <Button variant="outline" onClick={copyLoginUrl}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h2 className="font-semibold">Que se sincroniza a Web</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Diagramas y versiones.</li>
                <li>Memoria por proyecto, base de datos y equipo.</li>
                <li>Permisos de skills y guardas locales por base conectada.</li>
                <li>Presencia y colaboracion en tiempo real.</li>
              </ul>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h2 className="font-semibold">Que queda local</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>Credenciales de base de datos.</li>
                <li>Hosts reales y passwords.</li>
                <li>MCP Local y sidecar.</li>
                <li>Conexiones activas de esta maquina.</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Monitor className="mb-2 h-5 w-5 text-primary" />
              <h2 className="font-semibold">Modo local</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Usas Desktop para conectar bases, leer schemas, generar diagramas y ejecutar skills con MCP. Ideal cuando la base solo existe en tu maquina o red privada.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <Users className="mb-2 h-5 w-5 text-primary" />
              <h2 className="font-semibold">Modo sincronizado</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Publicas diagramas y memoria segura a Web para verlos desde otra PC o compartirlos con un companero sin instalar Desktop.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-primary">
            <ShieldCheck className="mr-2 inline h-4 w-4" />
            Al iniciar sesion, Desktop debe quedarse abierto como cliente local. FluxSQL Web muestra lo sincronizado, pero no recibe passwords ni hosts secretos.
          </div>

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">Web autoriza este Desktop con la sesion real de FluxSQL. El token se recibe en el sidecar local para habilitar sincronizacion segura.</p>
        </section>
      </main>
    </div>
  )
}
