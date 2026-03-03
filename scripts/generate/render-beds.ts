/**
 * Offline audio bed renderer for KAY-OS.
 *
 * Uses Tone.js OfflineContext to render audio beds as WAV files.
 * Run with: npx tsx scripts/generate/render-beds.ts [bedId]
 *
 * If no bedId is provided, renders all beds from bed-configs.ts.
 * Output goes to scripts/generate/output/
 */

import { ALL_BED_CONFIGS, type BedRenderConfig } from './bed-configs';

async function renderBed(config: BedRenderConfig): Promise<void> {
  // Tone.js Offline rendering requires Node + Tone.js
  const Tone = await import('tone');
  const fs = await import('fs');
  const path = await import('path');

  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Rendering bed: ${config.id} (${config.duration}s)...`);

  // Tone.Offline renders to an AudioBuffer
  const buffer = await Tone.Offline(({ transport }) => {
    // Set BPM if active mode
    if (config.bpm) {
      transport.bpm.value = config.bpm;
    }

    if (config.mode === 'still') {
      // --- Still mode: binaural + drone + noise ---
      const masterGain = new Tone.Gain(0.45).toDestination();

      // Binaural
      const panL = new Tone.Panner(-1).connect(masterGain);
      const panR = new Tone.Panner(1).connect(masterGain);
      const oscL = new Tone.Oscillator({
        type: 'sine',
        frequency: config.carrierHz + config.binauralHz / 2,
      }).connect(panL);
      const oscR = new Tone.Oscillator({
        type: 'sine',
        frequency: config.carrierHz - config.binauralHz / 2,
      }).connect(panR);
      oscL.volume.value = -12;
      oscR.volume.value = -12;

      // Drone
      const droneGain = new Tone.Gain(Tone.dbToGain(-18)).connect(masterGain);
      const droneFundamental = new Tone.Oscillator({
        type: 'sine',
        frequency: 110,
      }).connect(droneGain);
      const droneHarmonic = new Tone.Oscillator({
        type: 'triangle',
        frequency: 330,
      }).connect(new Tone.Gain(Tone.dbToGain(-30)).connect(droneGain));

      // Noise
      const noiseGain = new Tone.Gain(Tone.dbToGain(config.noiseLevel)).connect(masterGain);
      const noiseFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 400,
        Q: 0.5,
      }).connect(noiseGain);
      const noise = new Tone.Noise('brown').connect(noiseFilter);

      // Start all
      oscL.start(0);
      oscR.start(0);
      droneFundamental.start(0);
      droneHarmonic.start(0);
      noise.start(0);
    } else {
      // --- Active mode: simplified generative render ---
      const masterGain = new Tone.Gain(0.45).toDestination();

      // Binaural
      const panL = new Tone.Panner(-1).connect(masterGain);
      const panR = new Tone.Panner(1).connect(masterGain);
      const oscL = new Tone.Oscillator({
        type: 'sine',
        frequency: config.carrierHz + config.binauralHz / 2,
      }).connect(panL);
      const oscR = new Tone.Oscillator({
        type: 'sine',
        frequency: config.carrierHz - config.binauralHz / 2,
      }).connect(panR);
      oscL.volume.value = -18;
      oscR.volume.value = -18;

      // Pad
      const reverb = new Tone.Reverb({
        decay: config.reverbDecay,
        wet: 0.7,
      }).connect(masterGain);

      const pad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 2, decay: 4, sustain: 0.7, release: 6 },
      }).connect(reverb);
      pad.volume.value = -12;

      // Noise texture
      const noiseGain = new Tone.Gain(Tone.dbToGain(config.noiseLevel)).connect(masterGain);
      const noiseFilter = new Tone.Filter({
        type: 'lowpass',
        frequency: 600,
        Q: 0.5,
      }).connect(noiseGain);
      const noise = new Tone.Noise('brown').connect(noiseFilter);

      // Schedule pad chords
      const rootNote = config.key ?? 'C2';
      const chordLoop = new Tone.Loop((time) => {
        pad.releaseAll(time);
        pad.triggerAttack([rootNote], time, 0.3);
      }, '32m');

      oscL.start(0);
      oscR.start(0);
      noise.start(0);
      chordLoop.start(0);
      transport.start(0);
    }
  }, config.duration);

  // Write WAV to output directory
  const outputPath = path.join(outputDir, config.outputFilename.replace('.mp3', '.wav'));
  const wavData = audioBufferToWav(buffer);
  fs.writeFileSync(outputPath, Buffer.from(wavData));

  console.log(`  → Written: ${outputPath}`);
}

function audioBufferToWav(buffer: InstanceType<typeof AudioBuffer>): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Interleave channels
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += bytesPerSample;
    }
  }

  return arrayBuffer;
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const bedId = process.argv[2];

  if (bedId) {
    const config = ALL_BED_CONFIGS.find((c) => c.id === bedId);
    if (!config) {
      console.error(`Unknown bed id: ${bedId}`);
      console.error(`Available: ${ALL_BED_CONFIGS.map((c) => c.id).join(', ')}`);
      process.exit(1);
    }
    await renderBed(config);
  } else {
    console.log(`Rendering ${ALL_BED_CONFIGS.length} beds...`);
    for (const config of ALL_BED_CONFIGS) {
      await renderBed(config);
    }
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
