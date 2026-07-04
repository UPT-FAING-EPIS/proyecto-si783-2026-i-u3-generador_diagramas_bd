'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Share, Network, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { loginAction } from '@/lib/backend/actions/auth/login'
import { registerAction } from '@/lib/backend/actions/auth/register'
import { useSearchParams } from 'next/navigation'

export function AuthView({ defaultTab = 'login' }: { defaultTab?: 'login' | 'register' }) {
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/dashboard'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    if (activeTab === 'login') {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } else {
      const result = await registerAction(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col relative overflow-hidden font-sans">
      
      {/* Back Button */}
      <a href="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm">
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </a>

      {/* Background Soft Gradients & Floating Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 p-6 lg:p-12 relative z-10">
        
        {/* Left Column (Marketing) */}
        <div className="flex-1 hidden lg:flex flex-col justify-center max-w-2xl relative">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#1A6CF6]/10 flex items-center justify-center">
              <Database className="w-6 h-6 text-[#1A6CF6]" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">FluxSQL</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/50 w-fit mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#1A6CF6] animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">Diseña. Visualiza. Optimiza.</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Crea diagramas de <br />
            <span className="text-[#1A6CF6]">bases de datos</span> <br />
            de forma profesional
          </h1>

          <p className="text-slate-600 text-lg max-w-md mb-12 leading-relaxed">
            FluxSQL te ayuda a modelar, visualizar y compartir tus bases de datos de manera rápida y eficiente.
          </p>

          {/* Scattered UI Illustration (Replacing old dark SVG) */}
          <div className="relative w-full h-64 mb-12">
            
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-5, -2, -5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-0 w-40 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden z-10"
            >
              <div className="h-7 bg-[#1A6CF6] flex items-center px-3 gap-2 text-white">
                <Database className="w-3 h-3" />
                <span className="text-[10px] font-bold">Products</span>
              </div>
              <div className="p-3 bg-white space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-700">id</span>
                  <span className="text-slate-400">UUID</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-700">name</span>
                  <span className="text-slate-400">VARCHAR</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 15, 0], rotate: [5, 8, 5] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-16 left-32 w-48 rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden z-20"
            >
              <div className="h-7 bg-purple-500 flex items-center px-3 gap-2 text-white">
                <Database className="w-3 h-3" />
                <span className="text-[10px] font-bold">Orders</span>
              </div>
              <div className="p-3 bg-white space-y-2">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-700">id</span>
                  <span className="text-slate-400">UUID</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-700">user_id</span>
                  <span className="text-slate-400 text-purple-500 font-bold">FK</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-semibold text-slate-700">total</span>
                  <span className="text-slate-400">DECIMAL</span>
                </div>
              </div>
            </motion.div>

            {/* Connecting Line */}
            <svg className="absolute top-20 left-24 w-32 h-20 pointer-events-none z-0" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))' }}>
              <path d="M 0 0 C 40 0, 40 60, 80 60" fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
            
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-8 right-32 w-16 h-6 bg-yellow-300 rounded-sm rotate-6 flex items-center justify-center shadow-sm"
            >
              <span className="text-[8px] font-mono font-bold text-yellow-900">Relations!</span>
            </motion.div>
          </div>

          {/* Features Bar */}
          <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#1A6CF6]" />
              <span>Modela sin límites</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1A6CF6]" />
              <span>Colabora en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <Share className="w-4 h-4 text-[#1A6CF6]" />
              <span>Exporta y comparte</span>
            </div>
          </div>
        </div>

        {/* Right Column (Form Panel) */}
        <div className="flex-1 w-full max-w-[460px] flex justify-center">
          <div className="w-full bg-white border border-slate-200 rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-20">
            
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 mb-8 relative">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(null) }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(null) }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'register' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Crear cuenta
              </button>
              
              {/* Tab Indicator */}
              <div 
                className="absolute bottom-0 h-0.5 bg-[#1A6CF6] rounded-t-full transition-all duration-300 ease-out"
                style={{ width: '50%', left: activeTab === 'login' ? '0%' : '50%' }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {activeTab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
                  </h2>
                  <p className="text-slate-500 text-sm">
                    {activeTab === 'login' ? 'Ingresa a tu cuenta para continuar' : 'Comienza a diseñar tus diagramas hoy mismo'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <input type="hidden" name="next" value={nextPath} />
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email" className="text-slate-700 font-semibold text-sm">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        defaultValue="test@fluxsql.com"
                        placeholder="ejemplo@correo.com"
                        className="pl-10 bg-white border-slate-200 focus-visible:ring-[#1A6CF6] text-slate-900 h-12 rounded-xl shadow-sm placeholder:text-slate-400"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-left">
                    <Label htmlFor="password" className="text-slate-700 font-semibold text-sm">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        defaultValue="123456"
                        placeholder="••••••••••••"
                        className="pl-10 pr-10 bg-white border-slate-200 focus-visible:ring-[#1A6CF6] text-slate-900 h-12 rounded-xl shadow-sm placeholder:text-slate-400"
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {activeTab === 'login' && (
                      <div className="flex justify-end pt-1">
                        <a href="#" className="text-xs font-semibold text-[#1A6CF6] hover:text-[#0f52c1] transition-colors">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-red-600 text-sm font-medium text-center bg-red-50 py-3 rounded-xl border border-red-100">
                      {error}
                    </div>
                  )}

                  {activeTab === 'login' && (
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox id="remember" className="border-slate-300 data-[state=checked]:bg-[#1A6CF6] data-[state=checked]:border-[#1A6CF6]" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recordarme
                      </label>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full bg-[#1A6CF6] hover:bg-[#0f52c1] text-white h-12 rounded-xl text-base font-bold mt-2 transition-all flex items-center justify-center gap-2 group shadow-md shadow-blue-500/20"
                  >
                    {isPending 
                      ? (activeTab === 'login' ? 'Iniciando...' : 'Registrando...') 
                      : (activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta')
                    }
                    {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>



                <div className="mt-8 text-center text-sm">
                  <span className="text-slate-500">
                    {activeTab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setError(null) }}
                    className="text-[#1A6CF6] font-bold hover:text-[#0f52c1] transition-colors"
                  >
                    {activeTab === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Global Footer */}
      <div className="w-full text-center py-6 text-xs text-slate-400 relative z-10 font-medium">
        © 2024 FluxSQL. Todos los derechos reservados.
      </div>
    </div>
  )
}
