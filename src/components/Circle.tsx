import React, { useState, useEffect, useRef } from 'react';
import { CIRCLE_KEYS } from '@/lib/musicLogic';
import { CHORD_SHAPES } from '@/lib/chordLibrary';
import ChordBox from './ChordBox';

interface CircleProps {
  activeTonic: string;
  activeFlavor: 'major' | 'minor';
  onSelectTonic: (tonic: string) => void;
  onToggleFlavor: () => void;
  audioEnabled: boolean;
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: Number((centerX + (radius * Math.cos(angleInRadians))).toFixed(4)),
        y: Number((centerY + (radius * Math.sin(angleInRadians))).toFixed(4))
    };
}

function describeDonutSlice(centerX: number, centerY: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
    const startOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const endOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const startInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);
    const endInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", startOuter.x, startOuter.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
        "L", endInner.x, endInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
        "Z"
    ].join(" ");
}

export default function Circle({ activeTonic, activeFlavor, onSelectTonic, onToggleFlavor, audioEnabled }: CircleProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  useEffect(() => {
     if (audioEnabled && !audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (!audioEnabled && audioCtxRef.current) {
         audioCtxRef.current.suspend();
     } else if (audioEnabled && audioCtxRef.current?.state === 'suspended') {
         audioCtxRef.current.resume();
     }
  }, [audioEnabled]);

  const playTone = (freq: number) => {
    if (!audioCtxRef.current || !audioEnabled) return;
    const ctx = audioCtxRef.current;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  };

  const playChord = (midi: number, isMinor: boolean) => {
    if (!audioEnabled) return;
    const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
    playTone(freq(midi));
    playTone(freq(midi + (isMinor ? 3 : 4)));
    playTone(freq(midi + 7));
  };

  const handleSliceClick = (data: typeof CIRCLE_KEYS[0]) => {
      onSelectTonic(activeFlavor === 'major' ? data.maj : data.min);
      // Let's use the midi of the root note for minor as well (data.midi is the relative major root).
      // For minor, the root is 3 semitones below the major!
      const rootMidi = activeFlavor === 'major' ? data.midi : data.midi - 3;
      playChord(rootMidi, activeFlavor === 'minor');
  };

  const activeIndex = CIRCLE_KEYS.findIndex(k => activeFlavor === 'major' ? k.maj === activeTonic : k.min === activeTonic);
  const subIdx = (activeIndex - 1 + 12) % 12;
  const domIdx = (activeIndex + 1) % 12;

  const sliceAngle = 360 / 12;

  return (
    <div className="relative w-[480px] h-[480px]">
      <svg viewBox="0 0 480 480" width="100%" height="100%" className="overflow-visible select-none">
        {CIRCLE_KEYS.map((data, index) => {
            const startAngle = (index * sliceAngle) - (sliceAngle / 2);
            const endAngle = (index * sliceAngle) + (sliceAngle / 2);
            const d = describeDonutSlice(240, 240, 60, 240, startAngle, endAngle);
            const majTextPos = polarToCartesian(240, 240, activeFlavor === 'major' ? 180 : 110, index * sliceAngle);
            const minTextPos = polarToCartesian(240, 240, activeFlavor === 'major' ? 110 : 180, index * sliceAngle);

            let fillColor = "#2a2e33"; // default flat gray
            if (index === activeIndex) fillColor = "#ec7e00"; // Highlight Orange
            else if (index === subIdx || index === domIdx) fillColor = "#8d969e"; // Muted

            let textColor = (index === activeIndex || index === subIdx || index === domIdx) ? "#191c1f" : "#ffffff";
            let innerTextColor = (index === activeIndex || index === subIdx || index === domIdx) ? "#191c1f" : "#8d969e";
            if (activeFlavor === 'minor') {
                const temp = textColor;
                textColor = innerTextColor;
                innerTextColor = temp;
            }

            return (
                <g key={data.index} 
                   onClick={() => handleSliceClick(data)} 
                   onMouseEnter={() => setHoveredKey(data.maj)}
                   onMouseLeave={() => setHoveredKey(null)}
                   className="cursor-pointer transition-all hover:opacity-85">
                    <path d={d} fill={fillColor} stroke="#191c1f" strokeWidth="4" className="transition-colors duration-200" />
                    <text x={majTextPos.x} y={majTextPos.y} className="font-display font-medium text-base transition-colors duration-200" fill={textColor} textAnchor="middle" dominantBaseline="middle">
                        {data.maj}
                    </text>
                    <text x={minTextPos.x} y={minTextPos.y} className="font-display font-medium text-[13px] transition-colors duration-200" fill={innerTextColor} textAnchor="middle" dominantBaseline="middle">
                        {data.min}
                    </text>
                </g>
            );
        })}
        
        <foreignObject x="180" y="190" width="120" height="100">
           <div className="flex flex-col items-center justify-center w-full h-full gap-2">
              <span className="text-[#8d969e] text-xs font-display font-medium uppercase tracking-widest leading-none mt-4">Escala</span>
              <button 
                 onClick={onToggleFlavor}
                 className="bg-[#191c1f] transition-all text-[#ec7e00] border border-[#ec7e00] hover:bg-[#ec7e00] hover:text-[#191c1f] text-sm font-display font-bold px-4 py-2 rounded-full"
              >
                 {activeFlavor === 'major' ? 'Maior' : 'Menor'}
              </button>
           </div>
        </foreignObject>
      </svg>
      
      {/* Popovers Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {CIRCLE_KEYS.map((data, index) => {
            const pos = polarToCartesian(240, 240, 180, index * sliceAngle);
            return (
                <div key={`pop-${data.index}`} 
                     className={`absolute transition-all duration-300 z-50 ${hoveredKey === data.maj ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                     style={{ left: `${pos.x}px`, top: `${pos.y}px`, transform: 'translate(-50%, -105%)' }}>
                    <div className="scale-[0.65] origin-bottom bg-[#191c1f] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#2a2e33]">
                        <ChordBox name={activeFlavor === 'major' ? data.maj : data.min} frets={CHORD_SHAPES[activeFlavor === 'major' ? data.maj : data.min]?.frets || [null,null,null,null,null,null]} hideBadge />
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}
