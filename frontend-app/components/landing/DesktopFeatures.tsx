'use client';

import { motion } from 'framer-motion';
import { Lock, GitCommit, FileText, Database } from 'lucide-react';

export default function DesktopFeatures() {
  const features = [
    {
      icon: <Lock className="w-6 h-6 text-slate-800" />,
      title: "Privacidad local-first",
      desc: "Tus credenciales, backups y resultados de consultas nunca van a la nube; todo se procesa de forma segura en tu equipo local."
    },
    {
      icon: <Database className="w-6 h-6 text-slate-800" />,
      title: "Skill Hub para múltiples motores",
      desc: "Instala y ejecuta habilidades estandarizadas para PostgreSQL, MySQL, SQL Server y MongoDB desde un solo lugar."
    },
    {
      icon: <GitCommit className="w-6 h-6 text-slate-800" />,
      title: "Versionado Visual",
      desc: "Disfruta de un historial colaborativo tipo Git para tus diagramas. Retrocede en el tiempo y revisa cambios de arquitectura."
    },
    {
      icon: <FileText className="w-6 h-6 text-slate-800" />,
      title: "Trazabilidad y Auditoría",
      desc: "Mantén un log riguroso: qué agente de IA propuso el cambio, en qué sandbox se probó y qué humano lo aprobó."
    }
  ];

  return (
    <section className="py-24 bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-6">
              Ventajas exclusivas <br className="hidden lg:block" /> de nuestra aplicación
            </h3>
            <p className="text-lg text-slate-600 mb-8">
              La arquitectura Sidecar de FluxSQL (FastAPI + Tauri + SQLite) está diseñada para potenciar tu trabajo con IA sin comprometer la seguridad empresarial.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Visual representation of local-first architecture */}
            <div className="w-full aspect-[4/3] bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-8 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
              
              <div className="relative z-10 w-full max-w-sm">
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg mb-4 transform -rotate-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <div className="font-mono text-sm text-blue-400">
                    <span className="text-pink-400">fluxsql</span> mcp start --sandbox
                  </div>
                  <div className="font-mono text-sm text-slate-300 mt-2">
                    ✓ Local Server running<br />
                    ✓ Sandbox Docker active<br />
                    ✓ Policy Engine loaded
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-lg transform rotate-2 translate-x-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Lock className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900">Escudo Local-First</h5>
                      <p className="text-xs text-slate-500 font-medium">Credenciales encriptadas en tu PC</p>
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
