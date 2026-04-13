export const CIRCLE_KEYS = [
    { index: 0, maj: 'C', min: 'Am', acc: '0', midi: 60, scale: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
    { index: 1, maj: 'G', min: 'Em', acc: '1#', midi: 67, scale: ['G', 'A', 'B', 'C', 'D', 'E', 'F#'] },
    { index: 2, maj: 'D', min: 'Bm', acc: '2#', midi: 62, scale: ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'] },
    { index: 3, maj: 'A', min: 'F#m', acc: '3#', midi: 69, scale: ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'] },
    { index: 4, maj: 'E', min: 'C#m', acc: '4#', midi: 64, scale: ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'] },
    { index: 5, maj: 'B', min: 'G#m', acc: '5#', midi: 71, scale: ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'] },
    { index: 6, maj: 'Gb', min: 'Ebm', acc: '6b', midi: 66, scale: ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'] },
    { index: 7, maj: 'Db', min: 'Bbm', acc: '5b', midi: 61, scale: ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'] },
    { index: 8, maj: 'Ab', min: 'Fm', acc: '4b', midi: 68, scale: ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'] },
    { index: 9, maj: 'Eb', min: 'Cm', acc: '3b', midi: 63, scale: ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'] },
    { index: 10, maj: 'Bb', min: 'Gm', acc: '2b', midi: 70, scale: ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'] },
    { index: 11, maj: 'F', min: 'Dm', acc: '1b', midi: 65, scale: ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'] }
];

export function getMajorScale(tonic: string): string[] {
    const info = CIRCLE_KEYS.find(k => k.maj === tonic);
    return info ? info.scale : [];
}

export function getScaleForTonic(tonic: string): string[] {
    const isMinor = tonic.endsWith('m');
    if (!isMinor) return getMajorScale(tonic);
    
    const info = CIRCLE_KEYS.find(k => k.min === tonic);
    if (!info) return [];
    return [
       info.scale[5], info.scale[6], info.scale[0], info.scale[1], info.scale[2], info.scale[3], info.scale[4]
    ];
}

export function getHarmonicField(tonic: string) {
    const scale = getScaleForTonic(tonic);
    if (!scale.length) return [];
    
    const isMinor = tonic.endsWith('m');
    const roman = isMinor 
      ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
      : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    
    const qualities = isMinor 
      ? ['m', 'dim', '', 'm', 'm', '', '']
      : ['', 'm', 'm', '', '', 'm', 'dim'];
    
    return scale.map((note, idx) => ({
        numeral: roman[idx],
        chordName: note + qualities[idx]
    }));
}

export function getPentatonicMajor(tonic: string) {
    const root = tonic.replace('m', '');
    const scale = getMajorScale(root);
    if (!scale.length) return [];
    return [
       { note: scale[0], interval: '1' },
       { note: scale[1], interval: '2' },
       { note: scale[2], interval: '3' },
       { note: scale[4], interval: '5' },
       { note: scale[5], interval: '6' }
    ];
}

export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const getRealChord = (shapeName: string, capoFret: number) => {
  if (capoFret === 0) return shapeName;
  const match = shapeName.match(/^([A-G][#b]?)(.*)/);
  if (!match) return shapeName;

  const [, root, suffix] = match;
  let rootIdx = NOTE_NAMES_SHARP.indexOf(root);
  if (rootIdx === -1) {
    rootIdx = NOTE_NAMES_FLAT.indexOf(root);
  }
  if (rootIdx === -1) return shapeName;
  
  const realRoot = NOTE_NAMES_SHARP[(rootIdx + capoFret) % 12];
  return `${realRoot}${suffix}`;
};

export const getShapeFromRealSound = (realChordName: string, capoFret: number) => {
  if (capoFret === 0) return realChordName;
  const match = realChordName.match(/^([A-G][#b]?)(.*)/);
  if (!match) return realChordName;

  const [, root, suffix] = match;
  let rootIdx = NOTE_NAMES_SHARP.indexOf(root);
  if (rootIdx === -1) rootIdx = NOTE_NAMES_FLAT.indexOf(root);
  if (rootIdx === -1) return realChordName;
  
  // Inverse capo: Shape = Real Sound - Capo
  const shapeRoot = NOTE_NAMES_SHARP[(rootIdx - capoFret + 12) % 12];
  // Replace flats if desired, but SHARP is standard
  return `${shapeRoot}${suffix}`;
};

export const getChordNotes = (chordName: string): string[] => {
    let cleanName = chordName;
    if (cleanName.endsWith('°')) cleanName = cleanName.replace('°', 'dim');
    
    const match = cleanName.match(/^([A-G][#b]?)(.*)/);
    if (!match) return [];
    const [, root, suffix] = match;
    
    let rootIdx = NOTE_NAMES_SHARP.indexOf(root);
    if (rootIdx === -1) rootIdx = NOTE_NAMES_FLAT.indexOf(root);
    if (rootIdx === -1) return [];

    let intervals = [0, 4, 7]; // Major triad
    if (suffix === 'm' || suffix === 'min') intervals = [0, 3, 7]; // Minor
    else if (suffix === 'dim') intervals = [0, 3, 6]; // Dim
    else if (suffix === 'aug' || suffix === '+') intervals = [0, 4, 8]; // Aug
    else if (suffix === 'sus4') intervals = [0, 5, 7];
    else if (suffix === 'sus2') intervals = [0, 2, 7];
    else if (suffix.includes('7')) {
       if (suffix === 'm7') intervals = [0, 3, 7, 10];
       else if (suffix === 'maj7' || suffix === '7M') intervals = [0, 4, 7, 11];
       else intervals = [0, 4, 7, 10]; // dom7
    }
    
    const arrayFormat = NOTE_NAMES_FLAT.includes(root) && root !== 'F' && root !== 'C' ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP;
    return intervals.map(inter => arrayFormat[(rootIdx + inter) % 12]);
};

export function getPentatonicMinor(tonic: string) {
    const root = tonic.replace('m', '');
    const rootMidi = CIRCLE_KEYS.find(k => k.maj === root)?.midi || 60;
    
    // Minor pentatonic format: 1, b3, 4, 5, b7
    // Using simple flat array for standard UI representation
    const getNote = (midi: number) => NOTE_NAMES_FLAT[midi % 12];
    
    return [
       { note: getNote(rootMidi), interval: '1' },
       { note: getNote(rootMidi + 3), interval: 'b3' },
       { note: getNote(rootMidi + 5), interval: '4' },
       { note: getNote(rootMidi + 7), interval: '5' },
       { note: getNote(rootMidi + 10), interval: 'b7' }
    ];
}
