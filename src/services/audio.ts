export type AudioEventListener = (eventName: string) => void;

class AudioService {
  private listeners: Set<AudioEventListener> = new Set();
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private synthTone(
    freq: number,
    duration: number,
    type: OscillatorType = "sine",
    gainVal = 0.15,
    delay = 0,
  ) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    setTimeout(() => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(gainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (err) {
        // Fallback silently if audio node is disposed
        console.debug("WebAudio synthTone failed", err);
      }
    }, delay * 1000);
  }

  private synthNoise(duration: number, gainVal = 0.08) {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
    } catch (err) {
      // Fallback silently if audio context is locked
      console.debug("WebAudio synthNoise failed", err);
    }
  }

  play(eventName: string): void {
    if (import.meta.env?.DEV || process.env.NODE_ENV !== "production") {
      console.log(`[Audio] Event triggered: ${eventName}`);
    }

    // Procedural Synth Sound Effects
    if (eventName === "card.flip") {
      this.synthTone(320, 0.08, "triangle", 0.12);
      this.synthTone(520, 0.09, "sine", 0.14, 0.03);
    } else if (eventName === "card.land") {
      this.synthTone(140, 0.12, "sine", 0.2);
    } else if (
      eventName === "pack.inspect.epic" ||
      eventName === "pack.inspect.legendary" ||
      eventName === "pack.rumble"
    ) {
      // Sub-bass resonance and low atmospheric hum for heavy high-tier packs
      this.synthTone(55, 0.6, "triangle", 0.25, 0);
      this.synthTone(82.4, 0.5, "sine", 0.18, 0.05);
      this.synthNoise(0.4, 0.06);
    } else if (
      eventName === "shop.purchase" ||
      eventName === "vault.seal.release" ||
      eventName === "coin.spend"
    ) {
      // Pneumatic vault release + golden coin shimmer
      this.synthNoise(0.18, 0.14);
      this.synthTone(987.77, 0.15, "sine", 0.2, 0.02); // B5
      this.synthTone(1318.51, 0.22, "triangle", 0.22, 0.08); // E6
      this.synthTone(1975.53, 0.35, "sine", 0.25, 0.14); // B6
    } else if (
      eventName === "pack.burst" ||
      eventName === "vault.open.transition" ||
      eventName === "pack.open" ||
      eventName === "foil.tear"
    ) {
      this.synthNoise(0.45, 0.2);
      this.synthTone(220, 0.25, "sawtooth", 0.18, 0);
      this.synthTone(587.33, 0.3, "sine", 0.22, 0.05);
      this.synthTone(880, 0.35, "triangle", 0.25, 0.1);
      this.synthTone(1760, 0.45, "sine", 0.28, 0.15);
    } else if (eventName === "pack.drumroll") {
      this.synthNoise(0.7, 0.1);
      this.synthTone(85, 0.6, "sawtooth", 0.08);
      this.synthTone(110, 0.5, "sine", 0.12, 0.2);
    } else if (
      eventName === "celebration" ||
      eventName === "card.reveal.legendary" ||
      eventName === "card.reveal.mythic"
    ) {
      this.synthTone(523.25, 0.25, "triangle", 0.2, 0); // C5
      this.synthTone(659.25, 0.25, "triangle", 0.2, 0.1); // E5
      this.synthTone(783.99, 0.3, "triangle", 0.25, 0.2); // G5
      this.synthTone(1046.5, 0.6, "sine", 0.3, 0.3); // C6 fanfare
    } else if (eventName === "card.reveal.epic") {
      this.synthTone(440, 0.2, "sine", 0.2, 0);
      this.synthTone(659.25, 0.35, "sine", 0.25, 0.1);
    } else if (eventName === "card.reveal.rare") {
      this.synthTone(392, 0.18, "sine", 0.15, 0);
      this.synthTone(587.33, 0.25, "sine", 0.18, 0.08);
    } else if (eventName === "reward.new") {
      this.synthTone(600, 0.15, "triangle", 0.18);
      this.synthTone(900, 0.25, "sine", 0.22, 0.08);
    } else if (
      eventName === "mission.complete" ||
      eventName === "mission.claim" ||
      eventName === "objective.complete"
    ) {
      // Tactical heavy impact + military triumphant brass chords + golden chime cascade
      this.synthNoise(0.35, 0.25); // Heavy sub explosion / impact
      this.synthTone(110, 0.4, "sawtooth", 0.3, 0); // Bass punch
      this.synthTone(523.25, 0.25, "sawtooth", 0.18, 0.05); // C5
      this.synthTone(659.25, 0.25, "triangle", 0.22, 0.12); // E5
      this.synthTone(783.99, 0.35, "sine", 0.25, 0.18); // G5
      this.synthTone(1046.5, 0.45, "sine", 0.32, 0.24); // C6 victory ring
      this.synthTone(1318.51, 0.3, "sine", 0.2, 0.32); // E6 sparkle
      this.synthTone(1567.98, 0.4, "sine", 0.25, 0.38); // G6 sparkle
    } else if (eventName === "mission.stamp") {
      // Hydraulic mechanical stamp slam + metallic clank
      this.synthNoise(0.2, 0.3);
      this.synthTone(90, 0.2, "sawtooth", 0.35, 0);
      this.synthTone(180, 0.15, "triangle", 0.25, 0.02);
      this.synthTone(750, 0.08, "sine", 0.15, 0.05);
    } else if (eventName === "mission.unseal" || eventName === "dossier.unseal") {
      // Holographic laser de-shielding + wax seal pop
      this.synthTone(350, 0.15, "sine", 0.15, 0);
      this.synthTone(700, 0.2, "triangle", 0.2, 0.06);
      this.synthTone(1400, 0.35, "sine", 0.25, 0.12);
      this.synthNoise(0.12, 0.18);
    } else if (eventName === "streak.fire") {
      // Burning plasma flame crackle
      this.synthTone(150, 0.25, "sawtooth", 0.15, 0);
      this.synthTone(240, 0.2, "triangle", 0.18, 0.05);
      this.synthNoise(0.18, 0.12);
    } else if (eventName === "xp.fly" || eventName === "coin.pickup") {
      // Rapid bright crystal coin pickups
      this.synthTone(1174.66, 0.08, "sine", 0.15, 0); // D6
      this.synthTone(1479.98, 0.09, "sine", 0.18, 0.04); // F#6
      this.synthTone(1760.0, 0.12, "sine", 0.2, 0.08); // A6
    } else if (eventName === "rank.promote" || eventName === "level.promote") {
      // Epic full orchestral fanfare + sub-bass thunder
      this.synthNoise(0.5, 0.3);
      this.synthTone(80, 0.6, "sawtooth", 0.4, 0);
      this.synthTone(523.25, 0.35, "sawtooth", 0.25, 0.1);
      this.synthTone(659.25, 0.35, "sawtooth", 0.25, 0.2);
      this.synthTone(783.99, 0.4, "triangle", 0.28, 0.3);
      this.synthTone(1046.5, 0.6, "sine", 0.35, 0.4);
      this.synthTone(1318.51, 0.7, "sine", 0.38, 0.55);
      this.synthTone(2093.0, 0.9, "sine", 0.45, 0.7);
    }

    this.listeners.forEach((listener) => {
      try {
        listener(eventName);
      } catch (err) {
        console.error(`[Audio] Listener error for event "${eventName}":`, err);
      }
    });
  }

  subscribe(listener: AudioEventListener): () => void {
    this.listeners.add(listener);
    return () => this.unsubscribe(listener);
  }

  unsubscribe(listener: AudioEventListener): void {
    this.listeners.delete(listener);
  }
}

export const audio = new AudioService();
