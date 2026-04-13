"use client";

import React, { useState } from 'react';
import Circle from '@/components/Circle';
import HarmonicField from '@/components/HarmonicField';
import Fretboard from '@/components/Fretboard';
import PentatonicSection from '@/components/PentatonicSection';
import { CIRCLE_KEYS } from '@/lib/musicLogic';
import ChordBox from '@/components/ChordBox';
import { CHORD_SHAPES } from '@/lib/chordLibrary';
import Link from 'next/link';

export default function Home() {
  const [activeTonic, setActiveTonic] = useState('C');
  const [activeFlavor, setActiveFlavor] = useState<'major' | 'minor'>('major');
  const [audioEnabled, setAudioEnabled] = useState(false);

  const toggleAudio = () => setAudioEnabled(!audioEnabled);

  const handleToggleFlavor = () => {
      const nextFlavor = activeFlavor === 'major' ? 'minor' : 'major';
      setActiveFlavor(nextFlavor);
      if (nextFlavor === 'minor') {
          const key = CIRCLE_KEYS.find(k => k.maj === activeTonic);
          if (key) setActiveTonic(key.min);
      } else {
          const key = CIRCLE_KEYS.find(k => k.min === activeTonic);
          if (key) setActiveTonic(key.maj);
      }
  };

  const activeData = CIRCLE_KEYS.find(k => activeFlavor === 'major' ? k.maj === activeTonic : k.min === activeTonic);
  const activeIndex = CIRCLE_KEYS.findIndex(k => activeFlavor === 'major' ? k.maj === activeTonic : k.min === activeTonic);

  const subIdx = (activeIndex - 1 + 12) % 12;
  const domIdx = (activeIndex + 1) % 12;

  const subChord = activeFlavor === 'major' ? CIRCLE_KEYS[subIdx].maj : CIRCLE_KEYS[subIdx].min;
  const domChord = activeFlavor === 'major' ? CIRCLE_KEYS[domIdx].maj : CIRCLE_KEYS[domIdx].min;
  const relativeChord = activeFlavor === 'major' ? activeData?.min : activeData?.maj;
  const relativeText = activeFlavor === 'major' ? 'Relativa Menor' : 'Relativa Maior';

  return (
    <main className="min-h-screen bg-rev-dark text-rev-white px-8 py-12 md:py-20 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-16">
        
        {/* Header Section */}
        <header className="flex flex-col gap-6 md:gap-0 md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-6xl md:text-8xl tracking-tighter text-[#ffffff] font-display">
                {activeTonic} {activeFlavor === 'major' ? 'Maior' : ''}
            </h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
             <Link href="/dicionario" className="btn-ghost flex items-center justify-center gap-2 w-full md:w-auto text-sm">
                📖 Dicionário de Acordes & Capo
             </Link>
             <button 
                onClick={toggleAudio}
                className={`btn-ghost ${audioEnabled ? 'active' : ''} w-full md:w-auto text-center text-sm`}
             >
                {audioEnabled ? 'Som: Ativado 🔊' : 'Som: Desativado 🔇'}
             </button>
          </div>
        </header>

        {/* Top Split Content: Circle + Fast Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex justify-center bg-[#191c1f] border border-[#2a2e33] p-12 rounded-[20px]">
            <Circle 
               activeTonic={activeTonic} 
               activeFlavor={activeFlavor}
               onSelectTonic={setActiveTonic} 
               onToggleFlavor={handleToggleFlavor}
               audioEnabled={audioEnabled} 
            />
          </div>

          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#191c1f] border border-[#2a2e33] p-6 rounded-[20px] transition-colors">
                <span className="text-[#8d969e] text-sm uppercase font-bold tracking-wider block mb-2">Acidentes</span>
                <strong className="text-3xl tracking-tight text-[#ffffff] font-display">{activeData?.acc || '-'}</strong>
              </div>
              <div className="bg-[#191c1f] border border-[#2a2e33] p-6 rounded-[20px] transition-colors relative group">
                <span className="text-[#8d969e] text-sm uppercase font-bold tracking-wider block mb-2">{relativeText}</span>
                <strong className="inline-block text-3xl tracking-tight text-[#ffffff] font-display cursor-default">{relativeChord || '-'}</strong>
                {relativeChord && (
                  <div className="absolute bottom-[90%] left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50">
                      <div className="origin-bottom scale-[0.65] bg-[#191c1f] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#2a2e33]">
                          <ChordBox name={relativeChord} frets={CHORD_SHAPES[relativeChord]?.frets || [null,null,null,null,null,null]} hideBadge />
                      </div>
                  </div>
                )}
              </div>
              
              <div className="bg-[#191c1f] border border-[#2a2e33] p-6 rounded-[20px] flex flex-col relative group">
                 <span className="text-[#8d969e] text-sm uppercase font-bold tracking-wider block mb-2">Subdominante ({activeFlavor === 'major' ? 'IV' : 'iv'})</span>
                 <strong className="inline-block text-3xl tracking-tight font-display text-[#ffffff] cursor-default">
                    {subChord}
                 </strong>
                 <div className="absolute bottom-[90%] left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50">
                    <div className="origin-bottom scale-[0.65] bg-[#191c1f] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#2a2e33]">
                        <ChordBox name={subChord} 
                                  frets={CHORD_SHAPES[subChord]?.frets || [null,null,null,null,null,null]} 
                                  hideBadge />
                    </div>
                 </div>
              </div>
              <div className="bg-[#191c1f] border border-[#2a2e33] p-6 rounded-[20px] flex flex-col relative group">
                 <span className="text-[#8d969e] text-sm uppercase font-bold tracking-wider block mb-2">Dominante ({activeFlavor === 'major' ? 'V' : 'v'})</span>
                 <strong className="inline-block text-3xl tracking-tight font-display text-[#ffffff] cursor-default">
                    {domChord}
                 </strong>
                 <div className="absolute bottom-[90%] left-1/2 -translate-x-1/2 mb-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all z-50">
                    <div className="origin-bottom scale-[0.65] bg-[#191c1f] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#2a2e33]">
                        <ChordBox name={domChord} 
                                  frets={CHORD_SHAPES[domChord]?.frets || [null,null,null,null,null,null]} 
                                  hideBadge />
                    </div>
                 </div>
              </div>
            </div>
            
            <div className="bg-[#191c1f] border border-[#2a2e33] p-8 rounded-[20px] flex flex-col gap-4 mt-4">
               <h3 className="text-2xl tracking-tight text-[#ffffff] font-display">Prática de Acidentes</h3>
               <div className="text-[#ffffff] text-base bg-[#2a2e33]/30 p-4 rounded-xl leading-relaxed border border-[#2a2e33]/50">
                  <strong className="font-semibold text-white">Sustenidos (#)</strong>: Fá, Dó, Sol, Ré, Lá, Mi, Si<br />
                  <span className="text-[#8d969e] text-sm mt-1 block">Fátima Disse Gue Recife Ama Muito Sol</span>
               </div>
               <div className="text-[#ffffff] text-base bg-[#2a2e33]/30 p-4 rounded-xl leading-relaxed border border-[#2a2e33]/50">
                  <strong className="font-semibold text-white">Bemóis (b)</strong>: Si, Mi, Lá, Ré, Sol, Dó, Fá<br />
                  <span className="text-[#8d969e] text-sm mt-1 block">Sim, Minha Linda Rege Só Doze Flautas</span>
               </div>
            </div>
          </div>
        </section>

        {/* Interactive Deep Dive Sections */}
        <section>
           <Fretboard tonic={activeTonic} />
        </section>
        
        <section>
           <PentatonicSection tonic={activeTonic} />
        </section>

        <section>
           <HarmonicField tonic={activeTonic} />
        </section>

      </div>
    </main>
  );
}
