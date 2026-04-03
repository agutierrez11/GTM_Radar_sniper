import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { Target, Zap, Search, Activity, ChevronRight, Globe, ShieldCheck } from 'lucide-react';
import { toast } from "sonner";
// import Markdown from "markdown-to-jsx"; // Removed to prevent crash due to missing dependency in Vite project

export default function Advanced() {
  // ... (rest of the state)

  return (
    // ...
            ) : (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <div className="text-[10px] font-black text-blue-600 mb-1 border border-blue-200 rounded px-2 inline-block">DOSSIER AVANZADO</div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{result.empresa}</h2>
                  </div>
                  <button onClick={() => setStep('form')} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200">NUEVA CONSULTA</button>
                </div>

                <div className="whitespace-pre-wrap text-slate-600 font-mono text-sm bg-slate-50 p-6 rounded-xl border border-slate-100 overflow-auto max-h-[60vh]">
                  {result.markdown}
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-slate-400">
                   <div className="flex items-center gap-2 text-xs">
                     <ShieldCheck className="w-4 h-4" />
                     <span>Analizado bajo protocolo NERV-v6</span>
                   </div>
                   <div className="text-xs italic">Cazador: {brief.vendedorUrl}</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-slate-400">
                   <div className="flex items-center gap-2 text-xs">
                     <ShieldCheck className="w-4 h-4" />
                     <span>Analizado bajo protocolo NERV-v6</span>
                   </div>
                   <div className="text-xs italic">Cazador: {brief.vendedorUrl}</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
