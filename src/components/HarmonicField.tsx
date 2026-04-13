import React from 'react';
import { getHarmonicField } from '@/lib/musicLogic';
import { CHORD_SHAPES } from '@/lib/chordLibrary';
import ChordBox from './ChordBox';

interface HarmonicFieldProps {
    tonic: string;
}

export default function HarmonicField({ tonic }: HarmonicFieldProps) {
  const field = getHarmonicField(tonic);

  return (
    <div className="flex flex-col gap-8 w-full mt-12 mb-8 bg-[#191c1f] p-8 rounded-[20px] border border-[#2a2e33]">
      <div>
        <h2 className="text-4xl tracking-tight text-[#ffffff] mb-2 font-display">Campo Harmônico de {tonic} Maior</h2>
        <p className="text-[#8d969e] text-lg">Os 7 acordes diatonicos contidos na tonalidade</p>
      </div>
      <div className="flex flex-wrap gap-6">
        {field.map((chord) => {
          // Normalize diminished representation for look-up
          let shapeLookup = chord.chordName;
          if (shapeLookup.endsWith('°')) {
              shapeLookup = shapeLookup.replace('°', 'dim');
          }

          const shape = CHORD_SHAPES[shapeLookup] || { frets: [null, null, null, null, null, null], fingers: [] };
          return (
            <div key={chord.numeral} className="flex flex-col items-center gap-3">
              <span className="font-display font-medium text-[#8d969e]">{chord.numeral}</span>
              <ChordBox name={chord.chordName} frets={shape.frets} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
