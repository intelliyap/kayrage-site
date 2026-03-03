/**
 * Onboarding binaural beat demo for KAY-OS.
 *
 * Provides a simple 30-second 10 Hz alpha binaural beat using Tone.js.
 * This is the ONLY remaining client-side Tone.js usage — dynamically
 * imported to keep it out of the main session bundle.
 */

export interface DemoControls {
  stop: () => void;
  dispose: () => void;
}

/**
 * Start the binaural demo. Returns controls to stop/dispose.
 * Must be called after a user gesture for autoplay policy.
 */
export async function startBinauralDemo(): Promise<DemoControls> {
  const Tone = await import("tone");
  await Tone.start();

  const carrier = 150;
  const beatFreq = 10;

  const panL = new Tone.Panner(-1).toDestination();
  const panR = new Tone.Panner(1).toDestination();

  const oscL = new Tone.Oscillator(carrier, "sine").connect(panL);
  const oscR = new Tone.Oscillator(carrier + beatFreq, "sine").connect(panR);

  oscL.volume.value = -20;
  oscR.volume.value = -20;

  oscL.start();
  oscR.start();

  return {
    stop: () => {
      oscL.stop();
      oscR.stop();
    },
    dispose: () => {
      oscL.dispose();
      oscR.dispose();
      panL.dispose();
      panR.dispose();
    },
  };
}
