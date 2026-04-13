import React from 'react';

interface CapoProps {
  currentCapo: number;
  setCapo: (fret: number) => void;
}

export default function CapoSelector({ currentCapo, setCapo }: CapoProps) {
  return (
    <div className="bg-[#191c1f] p-4 rounded-[20px] border border-[#2a2e33] flex items-center justify-between gap-6 w-full md:min-w-[300px]">
      <div className="flex flex-col">
        <span className="text-[10px] text-[#8d969e] font-bold uppercase tracking-wider font-display">Capo no Traste</span>
        <span className="text-2xl font-black text-[#ffffff] font-display">{currentCapo === 0 ? 'Nenhum' : `${currentCapo}ª`}</span>
      </div>
      <input 
        type="range" min="0" max="11" value={currentCapo}
        onChange={(e) => setCapo(parseInt(e.target.value))}
        className="flex-1 accent-[#ec7e00] cursor-pointer h-2 bg-[#2a2e33] rounded-lg appearance-none"
      />
    </div>
  );
}
