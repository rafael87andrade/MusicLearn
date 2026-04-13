const SVG_NS = "http://www.w3.org/2000/svg";

const circleData = [
    { index: 0, maj: 'C', min: 'Am', acc: '0 (Nenhum)', midi: 60 },
    { index: 1, maj: 'G', min: 'Em', acc: '1# (Fá#)', midi: 67 },
    { index: 2, maj: 'D', min: 'Bm', acc: '2# (Fá#, Dó#)', midi: 62 },
    { index: 3, maj: 'A', min: 'F#m', acc: '3# (Fá#, Dó#, Sol#)', midi: 69 },
    { index: 4, maj: 'E', min: 'C#m', acc: '4# (Fá#, Dó#, Sol#, Ré#)', midi: 64 },
    { index: 5, maj: 'B', min: 'G#m', acc: '5# / 7b', midi: 71 },
    { index: 6, maj: 'Gb', min: 'Ebm', acc: '6b / 6#', midi: 66 },
    { index: 7, maj: 'Db', min: 'Bbm', acc: '5b (Si, Mi, Lá, Ré, Sol)', midi: 61 },
    { index: 8, maj: 'Ab', min: 'Fm', acc: '4b (Si, Mi, Lá, Ré)', midi: 68 },
    { index: 9, maj: 'Eb', min: 'Cm', acc: '3b (Si, Mi, Lá)', midi: 63 },
    { index: 10, maj: 'Bb', min: 'Gm', acc: '2b (Si, Mi)', midi: 70 },
    { index: 11, maj: 'F', min: 'Dm', acc: '1b (Si)', midi: 65 }
];

// Audio Context
let audioCtx = null;
let audioEnabled = false;

document.getElementById('toggle-audio').addEventListener('click', (e) => {
    const btn = e.target;
    if (btn.dataset.state === 'off') {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        btn.dataset.state = 'on';
        btn.textContent = 'Som: Ativado';
        btn.classList.add('active');
        audioEnabled = true;
    } else {
        btn.dataset.state = 'off';
        btn.textContent = 'Som: Desativado';
        btn.classList.remove('active');
        audioEnabled = false;
    }
});

function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
}

function playTone(freq, type = 'sine', duration = 1.5) {
    if (!audioCtx || !audioEnabled) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Envelope: quick attack, slow release (flat sound)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function playChord(rootMidi) {
    if (!audioEnabled) return;
    const rootFreq = midiToFreq(rootMidi);
    const thirdFreq = midiToFreq(rootMidi + 4); // Major third
    const fifthFreq = midiToFreq(rootMidi + 7); // Perfect fifth
    
    // Play with a mix of sine and triangle for a pleasant electric piano-like sound
    playTone(rootFreq, 'sine', 2.0);
    playTone(thirdFreq, 'sine', 2.0);
    playTone(fifthFreq, 'sine', 2.0);
    
    playTone(rootFreq, 'triangle', 2.0);
}

// SVG generation geometry
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    // Subtract 90 to make 0 deg at TOP (12 o'clock)
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeDonutSlice(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle) {
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

let activeIndex = null;
let wedges = []; // to store path elements

function updateUI(index) {
    activeIndex = index;
    const data = circleData[index];
    
    // Update texts
    document.getElementById('key-title').textContent = data.maj + ' Maior';
    document.getElementById('key-title').classList.remove('placeholder');
    document.getElementById('key-accidents').textContent = data.acc;
    document.getElementById('key-relative').textContent = data.min;
    
    // Calculate neighbors
    // Subdominant: 1 step counter-clockwise
    let subIdx = (index - 1 + 12) % 12;
    // Dominant: 1 step clockwise
    let domIdx = (index + 1) % 12;
    
    document.getElementById('key-sub').textContent = circleData[subIdx].maj;
    document.getElementById('key-dom').textContent = circleData[domIdx].maj;
    
    // Highlight boxes
    document.getElementById('box-sub').classList.add('active-box');
    document.getElementById('box-dom').classList.add('active-box');

    // Update SVG styles
    wedges.forEach((w, i) => {
        w.path.setAttribute('class', 'wedge');
        // Reset colors using CSS classes via JS
        if (i === index) {
            w.path.classList.add('active');
        } else if (i === subIdx) {
            w.path.classList.add('subdominant');
        } else if (i === domIdx) {
            w.path.classList.add('dominant');
        }
    });

    // Play sound!
    playChord(data.midi);
}

function initCircle() {
    const container = document.getElementById('circle-container');
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 480 480");
    svg.setAttribute("class", "circle-svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    
    const centerX = 240;
    const centerY = 240;
    const outerRadius = 240;
    const innerRadius = 60; // gap in middle
    const sliceAngle = 360 / 12;

    circleData.forEach((data, index) => {
        const startAngle = (index * sliceAngle) - (sliceAngle / 2);
        const endAngle = (index * sliceAngle) + (sliceAngle / 2);
        
        // Form the slice
        const g = document.createElementNS(SVG_NS, "g");
        const path = document.createElementNS(SVG_NS, "path");
        const d = describeDonutSlice(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle);
        path.setAttribute('d', d);
        // Base styling
        path.setAttribute('class', 'wedge');
        path.setAttribute('stroke', '#191c1f');     // dark bg stroke to separate wedges
        path.setAttribute('stroke-width', '4');
        path.setAttribute('fill', '#2a2e33');       // flat gray default

        // Text positions
        const majTextPos = polarToCartesian(centerX, centerY, 180, index * sliceAngle);
        const minTextPos = polarToCartesian(centerX, centerY, 110, index * sliceAngle);

        const textMaj = document.createElementNS(SVG_NS, "text");
        textMaj.setAttribute('x', majTextPos.x);
        textMaj.setAttribute('y', majTextPos.y);
        textMaj.setAttribute('class', 'wedge-text');
        textMaj.textContent = data.maj;

        const textMin = document.createElementNS(SVG_NS, "text");
        textMin.setAttribute('x', minTextPos.x);
        textMin.setAttribute('y', minTextPos.y);
        textMin.setAttribute('class', 'wedge-text wedge-text-inner');
        textMin.textContent = data.min;

        g.appendChild(path);
        g.appendChild(textMaj);
        g.appendChild(textMin);
        
        g.style.cursor = 'pointer';
        g.addEventListener('click', () => updateUI(index));
        
        svg.appendChild(g);
        
        wedges.push({ path, textMaj, textMin });
    });

    // Central text
    const centerText = document.createElementNS(SVG_NS, "text");
    centerText.setAttribute('x', centerX);
    centerText.setAttribute('y', centerY);
    centerText.setAttribute('class', 'wedge-text');
    centerText.setAttribute('fill', '#505a63');
    centerText.textContent = "GPS";
    const centerSub = document.createElementNS(SVG_NS, "text");
    centerSub.setAttribute('x', centerX);
    centerSub.setAttribute('y', centerY + 20);
    centerSub.setAttribute('class', 'wedge-text wedge-text-inner');
    centerSub.textContent = "Harmônico";
    
    svg.appendChild(centerText);
    svg.appendChild(centerSub);

    container.appendChild(svg);
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    initCircle();
});
