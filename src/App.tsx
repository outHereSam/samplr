import { useCallback } from "react";
import "./App.css";
import { DropZone } from "./components/DropZone";
import { Knob } from "./components/Knob";
import { PresetSelector } from "./components/PresetSelector";
import { WaveformViewer } from "./components/WaveformViewer";
import { useSamplerEngine } from "./hooks/useSamplerEngine";

const formatHz = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}kHz`;
  }
  return `${Math.round(value)}Hz`;
};

function App() {
  const {
    fileName,
    waveform,
    isLoading,
    isPlaying,
    hasSample,
    filters,
    pitch,
    presetId,
    presets,
    loadFile,
    play,
    stop,
    setLowpass,
    setHighpass,
    setPitch,
    applyPreset,
  } = useSamplerEngine();

  const handleFiles = useCallback(
    (files: FileList) => {
      const [file] = Array.from(files);
      if (file) {
        loadFile(file);
      }
    },
    [loadFile]
  );

  const togglePlayback = useCallback(() => {
    if (!hasSample) return;
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [hasSample, isPlaying, play, stop]);

  return (
    <div className="text-white">
      <div className="max-w-6xl mx-auto px-5 py-10 lg:py-16 space-y-10">
        <header className="space-y-5">
          <p className="section-title">micro sampler</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-semibold tracking-tight text-4xl sm:text-5xl lg:text-6xl">
                samplr
              </h1>
              <p className="text-white/70 max-w-xl mt-3">
                Drag in any audio snippet and sculpt it with tactile controls.
                Dial in filters, shift the pitch, and swap presets to explore
                new textures—all right in the browser.
              </p>
            </div>
            <div className="glass-panel px-5 py-4 rounded-3xl text-sm text-white/70">
              <p className="font-[var(--font-code)] text-xs uppercase tracking-[0.3em] text-white/60">
                Status
              </p>
              <p className="text-lg font-semibold mt-1 text-white">
                {hasSample
                  ? isPlaying
                    ? "Playing sample"
                    : "Armed for playback"
                  : "Waiting for audio"}
              </p>
            </div>
          </div>
        </header>

        <main className="sampler-grid sampler-grid--two-col">
          <section className="flex flex-col gap-6">
            <DropZone
              label="Sample Input"
              fileName={fileName}
              isLoading={isLoading}
              onFiles={handleFiles}
            />
            <WaveformViewer data={waveform} hasSample={hasSample} />

            <div className="glass-panel rounded-3xl px-6 py-5 flex flex-wrap items-center gap-4 justify-between">
              <div>
                <p className="section-title">Transport</p>
                <p className="text-sm text-white/60">
                  {hasSample
                    ? fileName || "Sample loaded"
                    : "Load a file to engage playback."}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={togglePlayback}
                  disabled={!hasSample}
                  className={[
                    "px-5 py-3 rounded-2xl font-semibold transition-all",
                    hasSample
                      ? isPlaying
                        ? "bg-danger text-white shadow-[0_15px_30px_-15px_rgba(255,95,109,0.8)]"
                        : "bg-neon text-slate-950 shadow-[0_25px_45px_-25px_rgba(94,244,255,0.9)] text-black"
                      : "bg-white/10 text-white/40 cursor-not-allowed",
                  ].join(" ")}
                >
                  {isPlaying ? "Stop" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={() => play()}
                  disabled={!hasSample}
                  className={[
                    "px-5 py-3 rounded-2xl font-semibold border transition-colors",
                    hasSample
                      ? "border-white/20 text-white hover:border-white/40"
                      : "border-white/5 text-white/40 cursor-not-allowed",
                  ].join(" ")}
                >
                  Retrigger
                </button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="glass-panel rounded-3xl px-6 py-7 flex flex-col gap-6">
              <p className="section-title">Controls</p>
              <div className="flex flex-wrap gap-8 justify-center">
                <Knob
                  label="Low-pass"
                  min={800}
                  max={20000}
                  step={100}
                  value={filters.lowpass}
                  unit=""
                  onChange={(value) => setLowpass(value)}
                />
                <Knob
                  label="High-pass"
                  min={20}
                  max={3000}
                  step={40}
                  value={filters.highpass}
                  onChange={(value) => setHighpass(value)}
                />
                <Knob
                  label="Pitch"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={pitch}
                  unit="st"
                  onChange={(value) => setPitch(Number(value.toFixed(1)))}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-[0.8rem] text-white/70">
                <div>
                  <p className="section-title text-[0.65rem]">Low-pass</p>
                  <p className="font-semibold">{formatHz(filters.lowpass)}</p>
                </div>
                <div>
                  <p className="section-title text-[0.65rem]">High-pass</p>
                  <p className="font-semibold">{formatHz(filters.highpass)}</p>
                </div>
                <div>
                  <p className="section-title text-[0.65rem]">Pitch</p>
                  <p className="font-semibold">{pitch.toFixed(1)} st</p>
                </div>
              </div>
            </div>
            <div className="glass-panel rounded-3xl px-6 py-6">
              <PresetSelector
                presets={presets}
                selectedId={presetId}
                onSelect={applyPreset}
              />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
