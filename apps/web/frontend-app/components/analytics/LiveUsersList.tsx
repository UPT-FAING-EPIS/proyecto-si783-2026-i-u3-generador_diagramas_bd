'use client'

import { usePresence } from '@/components/providers/PresenceProvider'

export function LiveUsersList() {
  const { users } = usePresence()

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white p-4 flex items-center gap-3 shadow-sm">
        <span className="relative flex h-3 w-3">
          <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-300" />
        </span>
        <h3 className="text-sm font-semibold text-slate-500">Nadie conectado en este momento</h3>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
        </span>
        <h3 className="text-sm font-bold text-slate-900">Usuarios en vivo ({users.length})</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition hover:bg-slate-100">
            <div className="flex items-center gap-4">
              <div className="relative">
                {u.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 font-bold border-2 border-slate-200 shadow-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{u.name}</span>
                {u.isAnonymous ? (
                  <span className="text-xs text-slate-500">Navegando en la web</span>
                ) : (
                  <span className="text-xs text-slate-500">{u.email}</span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1.5">
               <span className="text-xs text-slate-400">
                 {new Date(u.joinedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
               {u.isAnonymous ? (
                 <span className="text-[10px] font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Visitante</span>
               ) : (
                 <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Registrado</span>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
