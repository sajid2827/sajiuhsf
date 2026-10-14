/**
 * MEDICORE Procedural Web Audio Engine
 * Bulletproof offline synthesis. Zero network requests, 100% resilient.
 */

export type AmbientSoundType = 'none' | 'gamma40' | 'pink' | 'white' | 'rain';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private currentAmbient: AmbientSoundType = 'none';
  private activeNodes: {
    sources?: AudioNode[];
    gains?: GainNode[];
    intervalId?: number;
  } = {};

  private initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        this.ambientGain.connect(this.masterGain);

        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext safe guard
    }
  }

  setMasterVolume(val: number) {
    try {
      this.initCtx();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
      }
    } catch {
      // Safe fallback
    }
  }

  setAmbientVolume(val: number) {
    try {
      this.initCtx();
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
      }
    } catch {
      // Safe fallback
    }
  }

  /**
   * Click sound effect disabled/removed per user request
   */
  playKeyClick(_pitch = 1.0) {
    // Click sound effect removed
  }

  /**
   * Harmonic completion chime
   */
  playCompletionChime() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const notes = [587.33, 880, 1174.66, 1760];
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        const startTime = now + idx * 0.09;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22 / (idx + 1), startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 1.85);
      });
    } catch {
      // Autoplay safe fallback
    }
  }

  /**
   * Stop current ambient stream
   */
  stopAmbient() {
    try {
      if (this.activeNodes.sources) {
        this.activeNodes.sources.forEach((src) => {
          try {
            (src as AudioBufferSourceNode).stop?.();
            src.disconnect();
          } catch {
            // Disconnect guard
          }
        });
      }
      if (this.activeNodes.intervalId) {
        clearInterval(this.activeNodes.intervalId);
      }
    } catch {
      // Stop guard
    }
    this.activeNodes = {};
    this.currentAmbient = 'none';
  }

  /**
   * Start procedural noise & focus filters
   */
  startAmbient(type: AmbientSoundType) {
    if (this.currentAmbient === type && type !== 'none') return;
    this.stopAmbient();
    if (type === 'none') return;

    try {
      this.initCtx();
      if (!this.ctx || !this.ambientGain) return;

      this.currentAmbient = type;

      if (type === 'gamma40') {
        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        const merger = this.ctx.createChannelMerger(2);
        const gain = this.ctx.createGain();

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(220, this.ctx.currentTime);

        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(260, this.ctx.currentTime); // 40Hz beat difference

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);

        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(this.ambientGain);

        oscL.start();
        oscR.start();

        this.activeNodes.sources = [oscL, oscR];
        return;
      }

      if (type === 'pink' || type === 'white') {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);

        if (type === 'white') {
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
        } else {
          let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
            b6 = white * 0.115926;
          }
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(type === 'white' ? 1800 : 1200, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambientGain);

        whiteNoise.start();
        this.activeNodes.sources = [whiteNoise];
        return;
      }

      if (type === 'rain') {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(950, this.ctx.currentTime);
        bandpass.Q.setValueAtTime(0.7, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

        noise.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.ambientGain);

        noise.start();
        this.activeNodes.sources = [noise];
      }
    } catch {
      // Catch all audio node issues
    }
  }

  getCurrentAmbient(): AmbientSoundType {
    return this.currentAmbient;
  }
}

export const soundEngine = new SoundEngine();
