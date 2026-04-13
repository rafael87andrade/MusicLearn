import React from 'react';
import { getPentatonicMajor, getPentatonicMinor, NOTE_NAMES_FLAT } from '@/lib/musicLogic';

const STRING_BASE_MIDI = [64, 59, 55, 50, 45, 40]; // High E (1st) to Low E (6th)
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

type ScaleNote = { note: string, interval: string };

function RenderFretboard({ tonic, scaleNotes, title, capoFret }: { tonic: string, scaleNotes: ScaleNote[], title: string, capoFret: number }) {
  const frets = Array.from({ length: 16 }, (_, i) => i); // 0 to 15
  
  // Flatten scale strings to check inclusion easily
  const validNotes = scaleNotes.map(n => n.note);
  // Helpper map
  const intervalMap = scaleNotes.reduce((acc, curr) => ({...acc, [curr.note]: curr.interval}), {} as Record<string, string>);

  function matchNote(midi: number): string | null {
      const baseNote = NOTE_NAMES_FLAT[midi % 12];
      // Enharmonic naive matching:
      const enharmonics: Record<string, string> = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };
      if (validNotes.includes(baseNote)) return baseNote;
      if (enharmonics[baseNote] && validNotes.includes(enharmonics[baseNote])) return enharmonics[baseNote];
      
      // In reverse: if scale uses flats but midi yields sharp (which doesn't happen with NOTE_NAMES_FLAT)
      return null;
  }

  return (
    <div className="flex flex-col gap-6 w-full mt-6 bg-[#191c1f] p-8 rounded-[20px] border border-[#2a2e33]">
      <div className="flex flex-row justify-between items-start">
          <div>
            <h3 className="text-xl tracking-tight text-[#ffffff] uppercase font-display font-medium">{title}</h3>
            <p className="text-[#8d969e] text-sm mt-1">Intervalos: {scaleNotes.map(n => n.interval).join(' - ')}</p>
          </div>
          <div className="flex gap-2">
             {scaleNotes.map(n => (
                 <div key={n.note} className="flex flex-col items-center">
                     <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold font-display ${n.interval === '1' ? 'bg-[#ffffff] text-[#191c1f]' : 'bg-[#ec7e00] text-[#191c1f]'}`}>
                         {n.note}
                     </span>
                     <span className="text-[#8d969e] text-xs mt-1 font-mono">{n.interval}</span>
                 </div>
             ))}
          </div>
      </div>
      
      <div className="relative mt-2 overflow-x-auto pb-4 w-full">
        <div className="flex flex-col relative w-full min-w-[700px] lg:min-w-full">
          {STRING_BASE_MIDI.map((baseMidi, strIdx) => (
            <div key={strIdx} className="flex relative items-center h-10 w-full">
              
              {/* String Label on Left */}
              <div className="w-[30px] shrink-0 flex justify-center text-[#8d969e] text-sm font-bold font-display z-10">
                 {STRING_NAMES[strIdx]}
              </div>

              {/* String visual line */}
              <div className="absolute h-[1px] bg-[#2a2e33] top-1/2 -translate-y-1/2 left-[30px] right-0 z-0"></div>
              
              <div className="flex flex-1 pl-1 w-full relative">
                {frets.map((fret) => {
                const midi = baseMidi + fret;
                const noteName = matchNote(midi);
                const isRoot = noteName && intervalMap[noteName] === '1';
                const interval = noteName ? intervalMap[noteName] : null;
                const isBehindCapo = fret < capoFret;
                
                return (
                  <div key={fret} className={`relative flex justify-center items-center h-10 z-10 ${fret === 0 ? 'w-[6%]' : 'flex-1'} ${isBehindCapo ? 'opacity-20 grayscale pointer-events-none' : ''}`}>
                     {/* Capo Fret Laser Wire */}
                     {fret === capoFret && capoFret > 0 && (
                        <div className="absolute left-0 h-[105%] w-[4px] bg-[#ec7e00] z-30 shadow-[0_0_8px_#ec7e00]"></div>
                     )}
                     {/* Fret wire */}
                     {fret !== 0 && (
                        <div className="absolute right-0 h-full w-[2px] bg-[#2a2e33]"></div>
                     )}
                     
                     {/* Nut wire */}
                     {fret === 0 && (
                        <div className="absolute right-0 h-full w-[4px] bg-[#8d969e]"></div>
                     )}

                     {noteName && (
                       <div className={`flex justify-center items-center rounded-full text-sm font-bold w-6 h-6 font-display border border-[#191c1f]
                                      ${isRoot ? 'bg-[#ffffff] text-[#191c1f] z-20' : 'bg-[#ec7e00] text-[#191c1f] z-20'}`}>
                         {isRoot && fret === 0 ? tonic : interval}
                       </div>
                     )}
                  </div>
                );
              })}
              </div>
            </div>
          ))}
          
          {/* Fret Markers at bottom */}
          <div className="flex relative items-center h-6 mt-1 text-[#8d969e] text-xs font-bold pl-[30px] w-full">
             <div className="flex flex-1 pl-1 w-full">
               {frets.map(fret => (
                 <div key={'marker'+fret} className={`flex justify-center ${fret === 0 ? 'w-[6%]' : 'flex-1'}`}>
                     {[3, 5, 7, 9, 12, 15].includes(fret) ? fret : ''}
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function PentatonicSection({ tonic, capoFret = 0 }: { tonic: string, capoFret?: number }) {
    const majorPenta = getPentatonicMajor(tonic);
    const minorPenta = getPentatonicMinor(tonic);
    const rootDisplay = tonic.replace('m', '');

    return (
        <div className="flex flex-col gap-8 w-full mt-16 mb-8">
            <div>
                <h2 className="text-4xl tracking-[-0.48px] mb-2 font-display text-[#ffffff]">Escalas Pentatônicas de {rootDisplay}</h2>
            </div>
            
            <RenderFretboard tonic={rootDisplay} scaleNotes={majorPenta} title={`Pentatônica Maior de ${rootDisplay}`} capoFret={capoFret} />
            <RenderFretboard tonic={rootDisplay} scaleNotes={minorPenta} title={`Pentatônica Menor de ${rootDisplay}`} capoFret={capoFret} />
        </div>
    );
}
