'use client';

import { motion } from 'framer-motion';
import { Bot, ShieldCheck, DatabaseZap } from 'lucide-react';

export default function DesktopFlow() {
  const steps = [
    {
      icon: <Bot className="w-8 h-8 text-blue-500" />,
      title: "1. Conecta tu Agente IA",
      desc: "Usa Claude, Cursor o GPT. Fluxy actúa como puente local seguro mediante el protocolo MCP (Model Context Protocol)."
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
      title: "2. Sandbox y Validación",
      desc: "Las sugerencias de la IA se prueban en un entorno aislado (Docker) y se genera un respaldo automático para evitar desastres."
    },
    {
      icon: <DatabaseZap className="w-8 h-8 text-emerald-500" />,
      title: "3. Aprobación y Producción",
      desc: "Revisa el reporte de impacto generado y aprueba manualmente los cambios. Cero riesgo operativo en tu base de datos real."
    }
  ];

  return (
    <section className="py-24 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">Flujo seguro de operación con IA</h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Fluxy soluciona el riesgo de usar agentes IA directamente. Validamos, aislamos y auditamos cada consulta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="p-8 rounded-2xl bg-[#fafafa] border border-slate-100 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mb-6 z-10 relative">
                {step.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 z-10 relative">{step.title}</h4>
              <p className="text-slate-600 leading-relaxed z-10 relative">{step.desc}</p>
              
              {/* Optional connector line for desktop */}
              {idx < 2 && (
                <div className="hidden md:block absolute top-16 -right-4 w-8 h-[2px] bg-slate-200 z-0" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
