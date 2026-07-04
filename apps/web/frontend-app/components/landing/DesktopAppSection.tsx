'use client';

import { motion } from 'framer-motion';
import { Download, Monitor, Database, LayoutTemplate, Workflow, Zap, Command } from 'lucide-react';
import Link from 'next/link';

export default function DesktopAppSection() {
  return (
    <section id="desktop-app" className="pt-24 pb-16 relative overflow-hidden bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-8 max-w-xl"
          >
            <h2 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Lleva FluxSQL a tu <br />
              escritorio.
            </h2>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Disfruta de una experiencia nativa increíblemente rápida. <span className="text-slate-900">Más poder, cero distracciones.</span>
            </p>

            <div>
              <a 
                href="https://github.com/UPT-FAING-EPIS/proyecto-si783-2026-i-u3-generador_diagramas_bd"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white px-8 py-4 rounded-full font-semibold transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5"
              >
                Descargar para Windows
              </a>
            </div>

            <div className="flex items-center gap-4 mt-8 pt-4">
              <span className="text-sm font-semibold text-slate-500">Únete a cientos de equipos</span>
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" alt="User" className="w-8 h-8 rounded-full border-2 border-[#fafafa]" />
                <img src="https://i.pravatar.cc/100?img=2" alt="User" className="w-8 h-8 rounded-full border-2 border-[#fafafa]" />
                <img src="https://i.pravatar.cc/100?img=3" alt="User" className="w-8 h-8 rounded-full border-2 border-[#fafafa]" />
                <img src="https://i.pravatar.cc/100?img=4" alt="User" className="w-8 h-8 rounded-full border-2 border-[#fafafa]" />
              </div>
            </div>
          </motion.div>

          {/* Abstract Atomic Visual Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full aspect-square flex items-center justify-center"
          >
            {/* Center Logo/Text */}
            <div className="relative z-20 text-6xl font-black text-slate-900 tracking-tighter">
              FluxSQL
            </div>

            {/* Orbit Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Horizontal Orbit */}
              <div className="absolute w-[90%] h-[35%] border-[1px] border-slate-200 rounded-[100%]" />
              {/* Angled Orbit 1 */}
              <div className="absolute w-[90%] h-[35%] border-[1px] border-slate-200 rounded-[100%] rotate-[60deg]" />
              {/* Angled Orbit 2 */}
              <div className="absolute w-[90%] h-[35%] border-[1px] border-slate-200 rounded-[100%] -rotate-[60deg]" />
            </div>

            {/* Orbit Nodes / Icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Top Node */}
              <div className="absolute -translate-y-[120px] translate-x-[40px] z-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12">
                  <Database className="text-white w-6 h-6" />
                </div>
              </div>
              
              {/* Bottom Node */}
              <div className="absolute translate-y-[130px] -translate-x-[20px] z-10">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                  <Command className="text-white w-6 h-6" />
                </div>
              </div>
              
              {/* Left Node */}
              <div className="absolute -translate-x-[160px] translate-y-[10px] z-10">
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                  <LayoutTemplate className="text-white w-6 h-6" />
                </div>
              </div>

              {/* Right Node */}
              <div className="absolute translate-x-[150px] translate-y-[70px] z-10">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg transform rotate-6">
                  <Workflow className="text-white w-6 h-6" />
                </div>
              </div>

              {/* Top Left Node */}
              <div className="absolute -translate-x-[80px] -translate-y-[90px] z-10">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="text-white w-5 h-5" />
                </div>
              </div>
              
              {/* Right Edge Node */}
              <div className="absolute translate-x-[200px] -translate-y-[10px] z-10">
                <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shadow-md">
                  <Monitor className="text-slate-600 w-5 h-5" />
                </div>
              </div>
            </div>
            
            {/* Subtle radial gradient behind for depth */}
            <div className="absolute inset-0 bg-radial-gradient from-white/40 to-transparent pointer-events-none" />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
