'use client';

import { motion } from 'framer-motion';
import { Download, Monitor, Zap, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DesktopAppSection() {
  return (
    <section id="desktop-app" className="py-24 relative overflow-hidden bg-white mt-12 border-y border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 w-fit text-blue-600 text-sm font-semibold">
              <Sparkles size={16} />
              <span>Nuevo Lanzamiento</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Lleva Fluxy a tu escritorio. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Más poder, cero distracciones.</span>
            </h2>
            
            <p className="text-lg text-slate-600">
              Disfruta de una experiencia nativa increíblemente rápida. Nuestra nueva aplicación de escritorio te permite diseñar bases de datos con mayor fluidez, integración profunda con el sistema y atajos de teclado avanzados.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link 
                href="/download" 
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Download size={20} />
                Descargar para Windows
              </Link>
              <Link 
                href="/download" 
                className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold transition-all border border-slate-200"
              >
                <Monitor size={20} />
                Ver otras plataformas
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Máximo Rendimiento</h4>
                  <p className="text-xs text-slate-500 mt-1">Renderizado nativo acelerado para proyectos inmensos.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-violet-50 text-violet-600">
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Trabajo Seguro</h4>
                  <p className="text-xs text-slate-500 mt-1">Autoguardado local y sincronización en segundo plano.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Image/Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-[2.5rem] blur-3xl transform -rotate-6" />
            <div className="relative rounded-3xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-4 shadow-2xl">
              <div className="w-full h-8 flex items-center gap-2 px-2 pb-2 mb-2 border-b border-slate-100">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="aspect-[4/3] rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center relative">
                {/* Abstract mockup of the app */}
                <div className="absolute inset-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="h-10 border-b border-slate-100 flex items-center px-4 bg-slate-50 rounded-t-xl gap-4">
                    <div className="w-32 h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
                  </div>
                  <div className="flex-1 flex p-4 gap-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="w-1/4 h-full bg-white border border-slate-100 rounded-lg shadow-sm" />
                    <div className="flex-1 h-full bg-white border border-blue-200 rounded-lg shadow-md relative overflow-hidden flex items-center justify-center">
                       <div className="w-48 h-32 bg-blue-50 border-2 border-blue-200 rounded-lg absolute" />
                       <div className="w-40 h-24 bg-emerald-50 border-2 border-emerald-200 rounded-lg absolute translate-x-32 translate-y-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
