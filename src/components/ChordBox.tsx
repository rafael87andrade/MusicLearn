import React from 'react';

interface ChordProps {
  name: string;
  frets: (number | null)[];
  hideBadge?: boolean;
  capoFret?: number;
  realName?: string;
}

export default function ChordBox({ name, frets, hideBadge, capoFret = 0, realName }: ChordProps) {
  const strings = [0, 1, 2, 3, 4, 5]; // 6 strings
  const positions = [1, 2, 3, 4];    // 4 visible frets
  const stringNames = ['E', 'A', 'D', 'G', 'B', 'E'];

  const validFrets = frets.filter(f => f !== null && f > 0) as number[];
  const minFret = validFrets.length > 0 ? Math.min(...validFrets) : 0;
  
  const offset = minFret > 2 ? minFret - 1 : 0;
  const isOpen = frets.some(f => f === 0);
  
  let typeBadge = "Acorde";
  if (isOpen) typeBadge = "Acorde Aberto";
  else if (offset > 0) typeBadge = "Pestana";
  else if (validFrets.length > 0) typeBadge = "Acorde Fechado";

  const tabNotation = frets.map(f => f === null ? 'x' : f).join(validFrets.some(f => f >= 10) ? '-' : '');

  return (
    <div className="flex flex-col items-center p-6 bg-[#191c1f] rounded-[20px] w-44 border border-[#2a2e33] transition-colors shadow-none group/box relative">
      {!hideBadge && (
         <div className="absolute top-2 right-2 opacity-0 group-hover/box:opacity-100 transition-opacity">
            <span className="bg-[#2a2e33] text-[#8d969e] text-[9px] font-bold px-2 py-1 rounded-[6px] tracking-wider font-display">
               {tabNotation}
            </span>
         </div>
      )}

      {realName && realName !== name ? (
         <div className="flex flex-col items-center mb-6 mt-2">
            <span className="font-display font-black text-2xl text-[#ffffff]">{realName}</span>
            <span className="font-display font-medium text-[11px] text-[#8d969e] uppercase mt-1 tracking-widest">Shape: {name}</span>
         </div>
      ) : (
         <div className="flex flex-col items-center mb-6 mt-2">
             <span className="font-display font-medium text-lg text-[#ffffff]">{name}</span>
         </div>
      )}
      
      <svg width="100" height="120" viewBox="0 0 100 120" className="overflow-visible">
        {/* Nut (Pestana do topo) */}
        {offset === 0 ? (
           <line x1="10" y1="20" x2="85" y2="20" stroke={capoFret > 0 ? "#ec7e00" : "#ffffff"} strokeWidth={capoFret > 0 ? "6" : "4"} />
        ) : (
           <text x="-8" y="34" fill="#8d969e" fontSize="12" fontFamily="Inter" fontWeight="semibold">{offset}fr</text>
        )}
        
        {capoFret > 0 && offset === 0 && (
           <text x="92" y="23" fill="#ec7e00" fontSize="10" fontFamily="Inter" fontWeight="bold">CP.{capoFret}</text>
        )}
        
        {/* Desenho das Cordas */}
        {strings.map((s) => (
          <line key={s} x1={10 + s * 15} y1="20" x2={10 + s * 15} y2="95" stroke="#2a2e33" strokeWidth="1.5" />
        ))}

        {/* Desenho dos Trastes */}
        {positions.map((p) => (
          <line key={p} x1="10" y1={20 + p * 18.5} x2="85" y2={20 + p * 18.5} stroke="#2a2e33" strokeWidth="1.5" />
        ))}

        {/* Nomes das Cordas (Rodapé) */}
        {strings.map((s) => (
          <text key={`name-${s}`} x={10 + s * 15} y="112" fill="#8d969e" fontSize="10" fontFamily="Inter" textAnchor="middle" fontWeight="bold">
            {stringNames[s]}
          </text>
        ))}

        {/* Marcação das Notas */}
        {frets.map((fretRaw, stringIdx) => {
          if (fretRaw === null) {
            // X (Corda Muda)
            return <text key={stringIdx} x={6.5 + stringIdx * 15} y="10" fill="#8d969e" fontSize="12" fontFamily="Inter" fontWeight="bold">✕</text>;
          }
          if (fretRaw === 0) {
            // Bolinha de corda solta
            return (
              <g key={stringIdx}>
                <circle cx={10 + stringIdx * 15} cy="9" r="4" fill="transparent" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            );
          }
          
          const relativeFret = fretRaw - offset;
          return (
            // Bolinha laranja de dedo
            <circle key={stringIdx} cx={10 + stringIdx * 15} cy={11 + relativeFret * 18.5} r="5" fill="#ec7e00" />
          );
        })}
      </svg>
      
      {/* Badge inferior inspirado no design da captura */}
      {!hideBadge && (
        <div className={`mt-6 px-4 py-1.5 text-xs rounded-full font-bold font-display tracking-wide
          ${isOpen ? 'bg-[#ffffff]/10 text-[#ffffff] border border-[#ffffff]/30' : 'bg-[#8d969e]/10 text-[#8d969e] border border-[#8d969e]/30'}`}>
           {typeBadge}
        </div>
      )}
    </div>
  );
}
