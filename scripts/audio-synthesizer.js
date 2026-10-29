/**
 * TRITON — Interactive Audio Experience & Synthesizer
 * 
 * Powered by native Web Audio API & HTML5 Canvas.
 * Demonstrates:
 * 1. Spatial Immersion (3D soundstage simulation)
 * 2. Active Isolation (Acoustic attenuation simulation)
 * 3. Transparency Mode (Wideband ambient passthrough)
 * 4. Real-time dynamic waveform visualizer
 * 5. Interactive Audiophile Frequency Response curve
 */

(function () {
  'use strict';

  // Audio Context & State
  let audioCtx = null;
  let isPlaying = false;
  let currentMode = 'spatial'; // 'spatial' | 'isolation' | 'transparency'
  let masterGain = null;
  let filterNode = null;
  let pannerNode = null;
  let oscillators = [];
  let noiseNode = null;
  let animId = null;

  // Visualizer Canvas
  const soundCanvas = document.getElementById('sound-canvas');
  const soundCtx = soundCanvas ? soundCanvas.getContext('2d') : null;

  // Frequency Graph Canvas
  const freqCanvas = document.getElementById('freq-canvas');
  const freqCtx = freqCanvas ? freqCanvas.getContext('2d') : null;

  // UI Elements
  const playBtn = document.getElementById('play-audio-btn');
  const playBtnText = document.getElementById('play-btn-text');
  const audioStatusLabel = document.getElementById('audio-status-label');
  const modeButtons = document.querySelectorAll('.sound-mode-btn');

  // --------------------------------------------------------------------------
  // Web Audio Synthesis Engine
  // --------------------------------------------------------------------------
  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);

    // Multi-mode Filter
    filterNode = audioCtx.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(14000, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(1.5, audioCtx.currentTime);

    // Stereo Panner
    if (audioCtx.createStereoPanner) {
      pannerNode = audioCtx.createStereoPanner();
      pannerNode.pan.setValueAtTime(0, audioCtx.currentTime);
      filterNode.connect(pannerNode);
      pannerNode.connect(masterGain);
    } else {
      filterNode.connect(masterGain);
    }

    masterGain.connect(audioCtx.destination);
  }

  function startAudio() {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopOscillators();

    // Create a rich harmonic chord (D minor 9th / ambient ethereal drone)
    // D3 (146.83Hz), A3 (220.00Hz), F4 (349.23Hz), C5 (523.25Hz), E5 (659.25Hz)
    const frequencies = [146.83, 220.00, 349.23, 523.25, 659.25];

    oscillators = frequencies.map((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const oscGain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      // Subtle detune for lush spatial chorus
      osc.detune.setValueAtTime((idx - 2) * 4.5, audioCtx.currentTime);

      const amp = 0.08 / (idx + 1);
      oscGain.gain.setValueAtTime(amp, audioCtx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filterNode);
      osc.start();
      return osc;
    });

    applyAcousticMode(currentMode);

    // Smooth fade in
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.65, audioCtx.currentTime + 1.2);

    isPlaying = true;
    updateUIState();
  }

  function stopAudio() {
    if (!audioCtx || !isPlaying) return;
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

    setTimeout(() => {
      stopOscillators();
      isPlaying = false;
      updateUIState();
    }, 600);
  }

  function stopOscillators() {
    oscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    oscillators = [];
  }

  function applyAcousticMode(mode) {
    currentMode = mode;
    if (!audioCtx || !filterNode) return;

    const now = audioCtx.currentTime;

    if (mode === 'spatial') {
      // Wide open frequency, dynamic stereo drift
      filterNode.frequency.exponentialRampToValueAtTime(18000, now + 0.4);
      filterNode.Q.setValueAtTime(1.0, now + 0.4);
      if (audioStatusLabel) audioStatusLabel.textContent = 'MODE: 3D SPATIAL IMMERSION (360° AUDIO FIELD)';
    } else if (mode === 'isolation') {
      // Sub-bass focused, attenuation of harsh ambient frequencies
      filterNode.frequency.exponentialRampToValueAtTime(3200, now + 0.4);
      filterNode.Q.setValueAtTime(2.2, now + 0.4);
      if (audioStatusLabel) audioStatusLabel.textContent = 'MODE: ACTIVE NOISE ISOLATION (-48dB HYBRID ANC)';
    } else if (mode === 'transparency') {
      // Ultra-transparent high-frequency fidelity, natural passthrough
      filterNode.frequency.exponentialRampToValueAtTime(20000, now + 0.4);
      filterNode.Q.setValueAtTime(0.7, now + 0.4);
      if (audioStatusLabel) audioStatusLabel.textContent = 'MODE: SMART TRANSPARENCY (ZERO OCCLUSION)';
    }
  }

  function updateUIState() {
    if (playBtnText) {
      playBtnText.textContent = isPlaying ? 'Pause Audio Experience' : 'Preview Acoustic Engine';
    }
    if (playBtn) {
      if (isPlaying) {
        playBtn.style.background = '#00D6FF';
        playBtn.style.color = '#000000';
      } else {
        playBtn.style.background = '#0050FF';
        playBtn.style.color = '#FFFFFF';
      }
    }
  }

  // --------------------------------------------------------------------------
  // Visualizer Canvas Drawing Loop
  // --------------------------------------------------------------------------
  let phase = 0;
  function renderVisualizer() {
    if (!soundCanvas || !soundCtx) return;

    const w = soundCanvas.width = soundCanvas.offsetWidth * (window.devicePixelRatio || 1);
    const h = soundCanvas.height = soundCanvas.offsetHeight * (window.devicePixelRatio || 1);

    soundCtx.fillStyle = '#020204';
    soundCtx.fillRect(0, 0, w, h);

    // Grid lines
    soundCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    soundCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      soundCtx.beginPath();
      soundCtx.moveTo(x, 0);
      soundCtx.lineTo(x, h);
      soundCtx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      soundCtx.beginPath();
      soundCtx.moveTo(0, y);
      soundCtx.lineTo(w, y);
      soundCtx.stroke();
    }

    const amplitude = isPlaying ? 35 : 8;
    const waveCount = 3;

    for (let i = 0; i < waveCount; i++) {
      soundCtx.beginPath();
      const alpha = 0.8 - i * 0.25;
      const gradient = soundCtx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, `rgba(0, 80, 255, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(0, 214, 255, ${alpha})`);
      gradient.addColorStop(1, `rgba(0, 80, 255, ${alpha})`);

      soundCtx.strokeStyle = gradient;
      soundCtx.lineWidth = 2.5 - i * 0.5;

      for (let x = 0; x < w; x += 4) {
        const freqMultiplier = (i + 1) * 0.008;
        const speed = isPlaying ? (phase * 0.04 * (i + 1)) : (phase * 0.015);
        const y = h / 2 + Math.sin(x * freqMultiplier + speed) * amplitude * Math.cos(x * 0.002 + speed * 0.5);
        if (x === 0) {
          soundCtx.moveTo(x, y);
        } else {
          soundCtx.lineTo(x, y);
        }
      }
      soundCtx.stroke();
    }

    phase += 1;
    requestAnimationFrame(renderVisualizer);
  }

  // --------------------------------------------------------------------------
  // Frequency Response Curve Canvas
  // --------------------------------------------------------------------------
  let currentFreqProfile = 'reference';

  function drawFrequencyCurve() {
    if (!freqCanvas || !freqCtx) return;

    const w = freqCanvas.width = freqCanvas.offsetWidth * (window.devicePixelRatio || 1);
    const h = freqCanvas.height = freqCanvas.offsetHeight * (window.devicePixelRatio || 1);

    freqCtx.fillStyle = '#030304';
    freqCtx.fillRect(0, 0, w, h);

    // dB grid
    freqCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    freqCtx.lineWidth = 1;
    for (let y = 30; y < h; y += 40) {
      freqCtx.beginPath();
      freqCtx.moveTo(0, y);
      freqCtx.lineTo(w, y);
      freqCtx.stroke();
    }

    // Reference Harman Target (Dotted Gray)
    freqCtx.beginPath();
    freqCtx.setLineDash([4, 4]);
    freqCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    freqCtx.lineWidth = 1.5;
    freqCtx.moveTo(0, h * 0.52);
    freqCtx.bezierCurveTo(w * 0.25, h * 0.48, w * 0.65, h * 0.55, w, h * 0.62);
    freqCtx.stroke();
    freqCtx.setLineDash([]);

    // TRITON Custom Acoustic Architecture Curve (Glowing Cyan Gradient)
    const curveGrad = freqCtx.createLinearGradient(0, 0, w, 0);
    curveGrad.addColorStop(0, '#0050FF');
    curveGrad.addColorStop(0.5, '#00D6FF');
    curveGrad.addColorStop(1, '#FFFFFF');

    freqCtx.beginPath();
    freqCtx.strokeStyle = curveGrad;
    freqCtx.lineWidth = 3;
    freqCtx.shadowColor = 'rgba(0, 214, 255, 0.6)';
    freqCtx.shadowBlur = 14;

    if (currentFreqProfile === 'reference') {
      // Near-perfect flat audiophile studio curve with silky extended highs
      freqCtx.moveTo(0, h * 0.50);
      freqCtx.bezierCurveTo(w * 0.2, h * 0.44, w * 0.6, h * 0.46, w * 0.82, h * 0.38);
      freqCtx.lineTo(w, h * 0.48);
    } else if (currentFreqProfile === 'bass') {
      // Sub-bass elevation
      freqCtx.moveTo(0, h * 0.35);
      freqCtx.bezierCurveTo(w * 0.25, h * 0.38, w * 0.6, h * 0.52, w * 0.85, h * 0.45);
      freqCtx.lineTo(w, h * 0.55);
    } else {
      // Vocal boost
      freqCtx.moveTo(0, h * 0.55);
      freqCtx.bezierCurveTo(w * 0.3, h * 0.52, w * 0.55, h * 0.30, w * 0.8, h * 0.36);
      freqCtx.lineTo(w, h * 0.50);
    }

    freqCtx.stroke();
    freqCtx.shadowBlur = 0; // reset
  }

  // --------------------------------------------------------------------------
  // Event Bindings
  // --------------------------------------------------------------------------
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (isPlaying) {
        stopAudio();
      } else {
        startAudio();
      }
    });
  }

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      applyAcousticMode(mode);
    });
  });

  // Freq profile toggles if present
  window.setFreqProfile = function (profile) {
    currentFreqProfile = profile;
    drawFrequencyCurve();
  };

  // Start visualizer animation
  renderVisualizer();
  setTimeout(drawFrequencyCurve, 200);
  window.addEventListener('resize', () => {
    drawFrequencyCurve();
  }, { passive: true });

})();
