// src/lib/chordLibrary.ts

import { NOTE_NAMES_SHARP, NOTE_NAMES_FLAT } from './musicLogic';

export type ChordShapeData = {
    frets: (number | null)[];
    variations?: {
        name: string;
        frets: (number | null)[];
    }[];
};

const TEMPLATES: Record<string, Record<string, (number | null)[]>> = {
    'E': {
        '':     [0, 2, 2, 1, 0, 0],
        'm':    [0, 2, 2, 0, 0, 0],
        '7':    [0, 2, 0, 1, 0, 0],
        'm7':   [0, 2, 0, 0, 0, 0],
        'maj7': [0, null, 1, 1, 0, null],
        'sus4': [0, 2, 2, 2, 0, 0]
    },
    'A': {
        '':     [null, 0, 2, 2, 2, 0],
        'm':    [null, 0, 2, 2, 1, 0],
        '7':    [null, 0, 2, 0, 2, 0],
        'm7':   [null, 0, 2, 0, 1, 0],
        'maj7': [null, 0, 2, 1, 2, 0],
        'sus4': [null, 0, 2, 2, 3, 0],
        'sus2': [null, 0, 2, 2, 0, 0],
        'dim':  [null, 0, 1, 2, 1, null]
    },
    'D': {
        '':     [null, null, 0, 2, 3, 2],
        'm':    [null, null, 0, 2, 3, 1],
        '7':    [null, null, 0, 2, 1, 2],
        'm7':   [null, null, 0, 2, 1, 1],
        'maj7': [null, null, 0, 2, 2, 2],
        'sus4': [null, null, 0, 2, 3, 3],
        'sus2': [null, null, 0, 2, 3, 0]
    },
    'C': {
        '':     [null, 3, 2, 0, 1, 0],
        '7':    [null, 3, 2, 3, 1, 0],
        'maj7': [null, 3, 2, 0, 0, 0]
    },
    'G': {
        '':     [3, 2, 0, 0, 0, 3],
        '7':    [3, 2, 0, 0, 0, 1]
    }
};

function shiftFrets(frets: (number | null)[], amount: number): (number | null)[] {
    if (amount === 0) return [...frets];
    return frets.map(f => (f === null ? null : f + amount));
}

function minFretOf(frets: (number | null)[]): number {
    const valid = frets.filter(f => f !== null && f > 0) as number[];
    if (valid.length === 0) return 0;
    return Math.min(...valid);
}

// Generate the massive database automatically
export const CHORD_SHAPES = (() => {
    const db: Record<string, ChordShapeData> = {};
    const ALL_ROOTS = [...new Set([...NOTE_NAMES_SHARP, ...NOTE_NAMES_FLAT])];
    
    // Create base objects for all chords
    const variationsMap: Record<string, {name: string, frets: (number | null)[]}[]> = {};

    ALL_ROOTS.forEach(targetRoot => {
        let tgtIdx = NOTE_NAMES_SHARP.indexOf(targetRoot);
        if (tgtIdx === -1) tgtIdx = NOTE_NAMES_FLAT.indexOf(targetRoot);
        
        Object.keys(TEMPLATES).forEach(templateRoot => {
            const tmplIdx = NOTE_NAMES_SHARP.indexOf(templateRoot);
            let distance = (tgtIdx - tmplIdx) % 12;
            if (distance < 0) distance += 12;

            const shapes = TEMPLATES[templateRoot];
            Object.keys(shapes).forEach(suffix => {
                const chordName = `${targetRoot}${suffix}`;
                const shifted = shiftFrets(shapes[suffix], distance);
                
                // Do not add shapes beyond fret 12 as they are just octaves and squish UI
                if (minFretOf(shifted) > 11) return;

                if (!variationsMap[chordName]) variationsMap[chordName] = [];
                
                let positionName = distance === 0 ? `Shape Aberto (${templateRoot})` : `Shape de ${templateRoot} (${minFretOf(shifted)}ª Casa)`;
                
                variationsMap[chordName].push({
                    name: positionName,
                    frets: shifted
                });
            });
        });
    });

    // Sort and finalize DB
    Object.keys(variationsMap).forEach(chordName => {
        const sorted = variationsMap[chordName].sort((a, b) => minFretOf(a.frets) - minFretOf(b.frets));
        const mainShape = sorted[0];
        
        db[chordName] = {
            frets: mainShape.frets,
            variations: sorted.slice(1) // the rest are variations
        };
    });

    return db;
})();
