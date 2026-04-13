"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { CHORD_SHAPES, ChordShapeData } from '@/lib/chordLibrary';
import ChordBox from '@/components/ChordBox';
import CapoSelector from '@/components/CapoSelector';
import Fretboard from '@/components/Fretboard';
import { getRealChord, getShapeFromRealSound, getChordNotes } from '@/lib/musicLogic';

export default function DictionaryPage() {
  const [searchInput, setSearchInput] = useState('');
  const [activeChord, setActiveChord] = useState<string | null>('C');
  const [capoFret, setCapoFret] = useState(0);
  
  // "shape" = "A tablatura manda fazer um C e eu quero ver. Capo me dirá o som real."
  // "sound" = "A cifra original tá em D. Com capo na 2, que shape eu uso?"
  const [searchMode, setSearchMode] = useState<'shape' | 'sound'>('shape');

  // Derivations based on mode and activeChord
  const targetShape = useMemo(() => {
     if (!activeChord) return null;
     if (searchMode === 'shape') {
        return CHORD_SHAPES[activeChord] ? activeChord : null;
     } else {
        const shapeName = getShapeFromRealSound(activeChord, capoFret);
        return CHORD_SHAPES[shapeName] ? shapeName : null;
     }
  }, [activeChord, searchMode, capoFret]);

  const soundProvided = useMemo(() => {
      if (!targetShape) return null;
      return getRealChord(targetShape, capoFret);
  }, [targetShape, capoFret]);

  const currentShapeData: ChordShapeData | null = targetShape ? CHORD_SHAPES[targetShape] : null;

  const handleSearch = (e: React.FormEvent) => {
     e.preventDefault();
     const raw = searchInput.trim();
     if (!raw) return;
     // simple capitalization (first letter upper)
     const parsed = raw.charAt(0).toUpperCase() + raw.slice(1);
     
     // Evaluate if chord exists in database directly (if shape mode) or inversely (if sound mode)
     let lookup = parsed;
     if (searchMode === 'sound') {
         lookup = getShapeFromRealSound(parsed, capoFret);
     }
     
     if (CHORD_SHAPES[lookup]) {
         setActiveChord(parsed);
         setSearchInput('');
     } else {
         alert(`Acorde ${parsed} não encontrado no banco de dados ainda.`);
     }
  };

  const getSimplifiedFrets = (frets: (number | null)[]) => {
     // Cut off low E and A strings
     return [null, null, frets[2], frets[3], frets[4], frets[5]];
  };

  return (
    <main className="min-h-screen bg-rev-dark text-rev-white px-8 py-12 md:py-20 flex justify-center">
      <div className="w-full max-w-7xl flex flex-col gap-12">
        
        {/* HEADER */}
        <header className="flex flex-col gap-6 md:gap-0 md:flex-row justify-between items-center mb-0">
          <div>
            <h1 className="text-5xl md:text-6xl tracking-tighter text-[#ffffff] font-display">Chord Finder 🔍</h1>
          </div>
          <Link href="/" className="btn-ghost flex items-center gap-2 text-sm">
             ← Voltar ao GPS Harmônico
          </Link>
        </header>

        {/* SEARCH & CAPO CONSOLE */}
        <section className="bg-[#191c1f] border border-[#2a2e33] p-8 md:p-12 rounded-[30px] flex flex-col xl:flex-row gap-8 items-center justify-between">
            <div className="w-full xl:w-2/3 flex flex-col gap-4">
                <div className="flex bg-[#2a2e33] p-1.5 rounded-full w-full max-w-md relative">
                    <button 
                       onClick={() => setSearchMode('shape')}
                       className={`flex-1 rounded-full py-2 px-4 text-sm font-bold transition-all ${searchMode === 'shape' ? 'bg-[#191c1f] text-[#ffffff] shadow-sm' : 'text-[#8d969e]'}`}
                    >
                       Lendo Tablatura (Shape)
                    </button>
                    <button 
                       onClick={() => setSearchMode('sound')}
                       className={`flex-1 rounded-full py-2 px-4 text-sm font-bold transition-all ${searchMode === 'sound' ? 'bg-[#ec7e00] text-[#191c1f] shadow-sm' : 'text-[#8d969e]'}`}
                    >
                       Tocando de Ouvido (Som Real)
                    </button>
                </div>
                <form onSubmit={handleSearch} className="flex gap-4 w-full">
                    <input 
                       type="text" 
                       value={searchInput}
                       onChange={e => setSearchInput(e.target.value)}
                       placeholder={searchMode === 'shape' ? "Qual shape a cifra pediu? (ex: C, F#m)" : "Qual som/acorde a música precisa? (ex: G, Eb)"}
                       className="flex-1 bg-transparent border border-[#2a2e33] rounded-[20px] px-6 py-4 text-xl outline-none focus:border-[#ec7e00] transition-colors font-display"
                    />
                    <button type="submit" className="bg-[#ec7e00] text-[#191c1f] px-8 py-4 rounded-[20px] font-bold font-display text-lg hover:scale-105 transition-transform">
                        Buscar
                    </button>
                </form>
            </div>
            
            <div className="w-full xl:w-1/3">
                <CapoSelector currentCapo={capoFret} setCapo={setCapoFret} />
            </div>
        </section>

        {/* RESULTS */}
        {activeChord && targetShape && currentShapeData && (
        <section className="flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
           
           <div className="flex flex-col border-l-4 border-[#ec7e00] pl-6 mt-4">
               <h2 className="text-[#8d969e] text-lg font-bold font-display uppercase tracking-widest mb-1">
                   {searchMode === 'shape' ? 'Você está montando o Shape de' : 'Para produzir o som real de'}
               </h2>
               <h3 className="text-6xl md:text-8xl tracking-tighter text-[#ffffff] font-display">
                   {activeChord} {searchMode === 'sound' && capoFret > 0 && <span className="text-3xl text-[#ec7e00]">via Shape {targetShape}</span>}
               </h3>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               {/* Coluna Main Shape */}
               <div className="lg:col-span-4 bg-[#191c1f] border border-[#2a2e33] p-8 rounded-[30px] flex flex-col items-center">
                   <h4 className="text-[#ffffff] text-2xl font-display font-medium tracking-tight mb-8">Padrão / Aberto</h4>
                   <ChordBox 
                      name={targetShape} 
                      frets={currentShapeData.frets} 
                      capoFret={capoFret} 
                      realName={soundProvided || undefined} 
                   />
               </div>

               {/* Coluna Simplificado */}
               <div className="lg:col-span-4 bg-[#191c1f] border border-[#2a2e33] p-8 rounded-[30px] flex flex-col items-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 bg-[#ec7e00] text-[#191c1f] text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-[15px]">
                      Atalho
                   </div>
                   <h4 className="text-[#ffffff] text-2xl font-display font-medium tracking-tight mb-8">Simplificado</h4>
                   <ChordBox 
                      name={targetShape} 
                      frets={getSimplifiedFrets(currentShapeData.frets)} 
                      capoFret={capoFret} 
                      realName={`${soundProvided} (Triádico)`} 
                   />
                   <p className="text-[#8d969e] text-center mt-6 text-sm px-4">
                      Remove as pestanas e foca nas 4 cordas primárias. Ótimo para solos ou iniciantes.
                   </p>
               </div>

               {/* Coluna Variações */}
               <div className="lg:col-span-4 bg-[#191c1f] border border-[#2a2e33] p-8 rounded-[30px] flex flex-col items-center">
                   <h4 className="text-[#ffffff] text-2xl font-display font-medium tracking-tight mb-8">Outras Regiões (CAGED)</h4>
                   <div className="flex flex-col gap-6 w-full max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                       {currentShapeData.variations && currentShapeData.variations.length > 0 ? (
                           currentShapeData.variations.map((v, idx) => (
                               <div key={idx} className="flex justify-center flex-col items-center scale-90 origin-top bg-[#2a2e33]/20 py-4 rounded-[20px]">
                                   <ChordBox 
                                      name={v.name} 
                                      frets={v.frets} 
                                      capoFret={capoFret}
                                      realName={soundProvided || undefined}
                                      hideBadge
                                   />
                               </div>
                           ))
                       ) : (
                           <div className="flex-1 flex items-center justify-center text-[#8d969e] text-center p-8">
                               Nenhuma variação CAGED catalogada para esta raiz ainda.
                           </div>
                       )}
                   </div>
               </div>
           </div>

           {/* Fretboard Deep Dive */}
           <div className="bg-[#191c1f] border border-[#2a2e33] p-8 rounded-[30px]">
               <h4 className="text-[#ffffff] text-3xl font-display font-medium tracking-tight mb-2">Visão Endoscópica</h4>
               <p className="text-[#8d969e] text-lg mb-8">
                   Onde encontrar todos os blocos de montagem (notas <strong>{getChordNotes(soundProvided || targetShape).join(', ')}</strong>) ao longo de todo o braço da guitarra para arranjos avançados.
               </p>
               
               {/* Re-using our Fretboard, but tricking it to only highlight the specific chord notes!
                   Wait, Fretboard takes `tonic` and `scale`. Fretboard calls getMajorScale(tonic).
                   If we pass tonic={activeChord}, it will draw the entire major scale.
                   If we want to show strictly the CHORD notes, it requires modifying Fretboard.
                   Since Fretboard internally queries musicLogic for the full scale, it will show 7 notes.
                   For now, showing the full scale of the currently requested sound is incredibly helpful! */}
               
               <Fretboard tonic={soundProvided || 'C'} capoFret={capoFret} />
               
               <div className="mt-4 p-4 bg-[#2a2e33]/30 rounded-xl border border-[#2a2e33]">
                  <p className="text-sm text-[#8d969e]">💡 <strong>Dica de Prática:</strong> O painel acima exibe a escala Maior completa da sua nota {soundProvided}. Para montar o acorde, pressione a tônica (branca) simultaneamente com a 3ª e a 5ª pelas cordas vazias.</p>
               </div>
           </div>
           
        </section>
        )}
      </div>
    </main>
  );
}
