'use client'

import { useEffect, useRef, useState, createContext, useContext } from 'react'
import { createClient } from '@/lib/backend/supabase/client'
import { trackWebEvent } from '@/lib/backend/actions/telemetry/trackEvent'

export type PresenceState = {
  id: string
  isAnonymous: boolean
  name: string
  email?: string
  avatar?: string
  joinedAt: string
}

type PresenceContextType = {
  users: PresenceState[]
}

const PresenceContext = createContext<PresenceContextType>({ users: [] })

export function usePresence() {
  return useContext(PresenceContext)
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const trackedSession = useRef(false)
  const [users, setUsers] = useState<PresenceState[]>([])

  useEffect(() => {
    // 1. Registrar el inicio de sesión globalmente solo una vez por carga de página
    if (!trackedSession.current) {
      trackedSession.current = true
      trackWebEvent({ event: 'session_start' }).catch(() => {})
    }

    // 2. Conectar al canal de presencia de Supabase
    const supabase = createClient()
    const sessionId = Math.random().toString(36).substring(2, 9)
    const channel = supabase.channel('online-users')

    let isSubscribed = false

    const trackPresence = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      let state: PresenceState
      
      if (session?.user) {
        state = {
          id: `${session.user.id}_${sessionId}`,
          isAnonymous: false,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuario',
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url,
          joinedAt: new Date().toISOString()
        }
      } else {
        state = {
          id: `anon_${sessionId}`,
          isAnonymous: true,
          name: 'Visitante Web',
          joinedAt: new Date().toISOString()
        }
      }

      if (isSubscribed) {
        await channel.track(state)
      }
    }

    // Escuchar el evento de sincronización de Presencia en este mismo componente
    channel.on('presence', { event: 'sync' }, () => {
      const newState = channel.presenceState<PresenceState>()
      const onlineUsers = Object.values(newState).flat()
      
      // Remover duplicados estrictos por ID de sesión (protege de reconexiones)
      const uniqueUsers = Array.from(new Map(onlineUsers.map(u => [u.id, u])).values())
      setUsers(uniqueUsers)
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        isSubscribed = true
        await trackPresence()
      }
    })

    // Escuchar cambios de Auth (login, logout) para actualizar la presencia instantáneamente
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      if (isSubscribed) {
        trackPresence()
      }
    })

    return () => {
      isSubscribed = false
      supabase.removeChannel(channel)
      authListener.subscription.unsubscribe()
    }
  }, [])

  return (
    <PresenceContext.Provider value={{ users }}>
      {children}
    </PresenceContext.Provider>
  )
}
