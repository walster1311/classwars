'use client';

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  getMuted() {
    return this.isMuted;
  }

  // 1. Paper Whoosh & Crumple
  playPaperWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.15);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  // 2. Paper Ball Hit / Pop
  playPaperHit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  // 3. High Five Clap & Sparkle
  playHighFiveSnap() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Clap impact
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
    }
    const clap = ctx.createBufferSource();
    clap.buffer = buffer;
    const clapGain = ctx.createGain();
    clapGain.gain.setValueAtTime(0.5, ctx.currentTime);
    clapGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    clap.connect(clapGain);
    clapGain.connect(ctx.destination);
    clap.start();

    // Cheerful Sparkle Chime
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
      chimeGain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.3);
      chime.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chime.start(ctx.currentTime + idx * 0.04);
      chime.stop(ctx.currentTime + idx * 0.04 + 0.35);
    });
  }

  // 4. Dance Battle Beat Loop
  playDanceBeat() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const tempo = 128; // BPM
    const beatSec = 60 / tempo;
    const melody = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66];

    // Play 16 beats (approx 7.5 seconds of cute anime arcade groove)
    for (let i = 0; i < 16; i++) {
      const time = ctx.currentTime + i * (beatSec / 2);

      // Bass kick on downbeats
      if (i % 2 === 0) {
        const kick = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(140, time);
        kick.frequency.exponentialRampToValueAtTime(45, time + 0.1);
        kickGain.gain.setValueAtTime(0.35, time);
        kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        kick.connect(kickGain);
        kickGain.connect(ctx.destination);
        kick.start(time);
        kick.stop(time + 0.16);
      }

      // Synth arpeggio
      const note = melody[i % melody.length];
      const syn = ctx.createOscillator();
      const synGain = ctx.createGain();
      syn.type = 'square';
      syn.frequency.setValueAtTime(note, time);
      synGain.gain.setValueAtTime(0.12, time);
      synGain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
      syn.connect(synGain);
      synGain.connect(ctx.destination);
      syn.start(time);
      syn.stop(time + 0.19);
    }
  }

  // 5. Anime Power-Up Charging & Burst
  playPowerUpCharging(color: 'golden' | 'blue' | 'purple' = 'golden') {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Resonant hum rising in frequency
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = color === 'golden' ? 110 : (color === 'blue' ? 146.83 : 130.81);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 3.5, ctx.currentTime + 3.0);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 3.0);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2.8);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 3.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3.6);

    // Shockwave burst at T = 3.0s
    setTimeout(() => {
      this.playPowerBurst();
    }, 3000);
  }

  playPowerBurst() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // White noise shockwave
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.6);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  // 6. Paper Airplane Glide & Landing
  playAirplaneGlide() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(380, ctx.currentTime + 1.5);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 2.0);
  }

  // 7. Emoji Pop
  playEmojiPop() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  // 8. General UI Click / Chime
  playClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }
}

export const soundEffects = new SoundEffectsService();
