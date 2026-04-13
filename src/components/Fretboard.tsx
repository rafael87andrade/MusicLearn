import React from 'react';
import { getMajorScale, NOTE_NAMES_FLAT, getScaleForTonic } from '@/lib/musicLogic';

const STRING_BASE_MIDI = [64, 59, 55, 50, 45, 40]; // High E (1st) to Low E (6th)
const STRING_NAMES = ['e', 'B', 'G', 'D', 'A', 'E'];

function matchNote(midi: number, scale: string[]): string | null {
    const baseNote = NOTE_NAMES_FLAT[midi % 12];
    const enharmonics: Record<string, string> = { 'Db':'C#', 'Eb':'D#', 'Gb':'F#', 'Ab':'G#', 'Bb':'A#' };
    
    if (scale.includes(baseNote)) return baseNote;
    if (enharmonics[baseNote] && scale.includes(enharmonics[baseNote])) return enharmonics[baseNote];
    
    // For scales with B# or E#
    if (baseNote === 'C' && scale.includes('B#')) return 'B#';
    if (baseNote === 'F' && scale.includes('E#')) return 'E#';
    
    return null;
}

interface FretboardProps {
    tonic: string;
    capoFret?: number;
}

export default function Fretboard({ tonic, capoFret = 0 }: FretboardProps) {
  const frets = Array.from({ length: 16 }, (_, i) => i); // 0 to 15
  const scale = getScaleForTonic(tonic);

  return (
    <div className="flex flex-col gap-6 w-full mt-12 bg-[#191c1f] p-8 rounded-[20px] border border-[#2a2e33]">
      <div>
        <h2 className="text-4xl tracking-tight text-[#ffffff] font-display font-medium">Braço do Instrumento </h2>
        <p className="text-[#8d969e] text-lg mt-2">Notas da escala de {tonic} Maior pelo braço</p>
      </div>
      
      <div className="relative mt-4 overflow-x-auto pb-4 w-full">
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
                const noteName = matchNote(midi, scale);
                const isRoot = noteName === tonic;
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
                       <div className={`flex justify-center items-center rounded-full text-sm font-bold w-7 h-7 font-display border border-[#191c1f] transition-colors
                                      ${isRoot ? 'bg-[#ffffff] text-[#191c1f] z-20' : 'bg-[#ec7e00] text-[#191c1f] z-20'}`}>
                         {noteName}
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
