import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SamplerPreset = {
  id: string;
  name: string;
  description: string;
  params: {
    lowpass: number;
    highpass: number;
    pitch: number;
  };
};

export const SAMPLER_PRESETS: SamplerPreset[] = [
  {
    id: "clean",
    name: "Clean Slate",
    description: "Neutral response with airy top end.",
    params: { lowpass: 18000, highpass: 30, pitch: 0 },
  },
  {
    id: "lofi",
    name: "Lo-Fi Dust",
    description: "Throttled bandwidth and slight detune.",
    params: { lowpass: 3200, highpass: 200, pitch: -3 },
  },
  {
    id: "radiowash",
    name: "Radio Wash",
    description: "Mid-focused tone with warmer top.",
    params: { lowpass: 8000, highpass: 1200, pitch: 2 },
  },
  {
    id: "subshift",
    name: "Sub Shift",
    description: "Tight highs, sub-heavy pitch drop.",
    params: { lowpass: 12000, highpass: 40, pitch: -7 },
  },
];

const DEFAULT_FILTERS = {
  lowpass: 16000,
  highpass: 40,
};

const semitoneToRatio = (value: number) => 2 ** (value / 12);

const buildWaveformPoints = (buffer: AudioBuffer | null, buckets = 512) => {
  if (!buffer) return [] as number[];
  const channel = buffer.getChannelData(0);
  const samplesPerBucket = Math.max(1, Math.floor(channel.length / buckets));
  const points: number[] = [];

  for (let i = 0; i < buckets; i += 1) {
    const start = i * samplesPerBucket;
    let sum = 0;
    for (let j = 0; j < samplesPerBucket; j += 1) {
      sum += Math.abs(channel[start + j] ?? 0);
    }
    points.push(sum / samplesPerBucket);
  }

  const max = Math.max(...points, 1);
  return points.map((value) => value / max);
};

export function useSamplerEngine() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const hpFilterRef = useRef<BiquadFilterNode | null>(null);
  const lpFilterRef = useRef<BiquadFilterNode | null>(null);

  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  const [fileName, setFileName] = useState("");
  const [waveform, setWaveform] = useState<number[]>([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pitch, setPitch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [presetId, setPresetId] = useState<string>("clean");

  const ensureAudioGraph = useCallback(async () => {
    if (!audioCtxRef.current) {
      const globalWindow = window as Window &
        typeof globalThis & {
          webkitAudioContext?: typeof AudioContext;
        };
      const AudioContextCtor =
        globalWindow.AudioContext ?? globalWindow.webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error("Web Audio API is not available in this browser");
      }
      audioCtxRef.current = new AudioContextCtor();
    }
    const ctx = audioCtxRef.current;

    if (!hpFilterRef.current || !lpFilterRef.current) {
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = filters.highpass;

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = filters.lowpass;

      hp.connect(lp);
      lp.connect(ctx.destination);

      hpFilterRef.current = hp;
      lpFilterRef.current = lp;
    }

    return ctx;
  }, [filters.highpass, filters.lowpass]);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {
        // ignore if already stopped
      }
      sourceRef.current.disconnect();
      sourceRef.current.onended = null;
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const loadFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setIsLoading(true);
      stop();
      try {
        const ctx = await ensureAudioGraph();
        const data = await file.arrayBuffer();
        const decoded = await ctx.decodeAudioData(data);
        setBuffer(decoded);
        setFileName(file.name);
        setWaveform(buildWaveformPoints(decoded));
      } catch (error) {
        console.error("Unable to load audio file", error);
      } finally {
        setIsLoading(false);
      }
    },
    [ensureAudioGraph, stop]
  );

  const play = useCallback(async () => {
    if (!buffer) return;
    const ctx = await ensureAudioGraph();
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    stop();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = semitoneToRatio(pitch);

    const hp = hpFilterRef.current;
    if (hp) {
      source.connect(hp);
    } else {
      source.connect(ctx.destination);
    }

    source.onended = () => setIsPlaying(false);
    sourceRef.current = source;
    source.start();
    setIsPlaying(true);
  }, [buffer, ensureAudioGraph, pitch, stop]);

  const setLowpass = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, lowpass: value }));
  }, []);

  const setHighpass = useCallback((value: number) => {
    setFilters((prev) => ({ ...prev, highpass: value }));
  }, []);

  const applyPreset = useCallback((id: string) => {
    const preset = SAMPLER_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setPresetId(id);
    setFilters({
      lowpass: preset.params.lowpass,
      highpass: preset.params.highpass,
    });
    setPitch(preset.params.pitch);
  }, []);

  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    lpFilterRef.current?.frequency.linearRampToValueAtTime(
      filters.lowpass,
      now + 0.05
    );
  }, [filters.lowpass]);

  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    hpFilterRef.current?.frequency.linearRampToValueAtTime(
      filters.highpass,
      now + 0.05
    );
  }, [filters.highpass]);

  useEffect(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    if (sourceRef.current) {
      sourceRef.current.playbackRate.linearRampToValueAtTime(
        semitoneToRatio(pitch),
        now + 0.02
      );
    }
  }, [pitch]);

  useEffect(() => {
    return () => {
      stop();
      audioCtxRef.current?.close();
    };
  }, [stop]);

  const hasSample = useMemo(() => Boolean(buffer), [buffer]);

  return {
    fileName,
    waveform,
    isLoading,
    isPlaying,
    hasSample,
    filters,
    pitch,
    presetId,
    presets: SAMPLER_PRESETS,
    loadFile,
    play,
    stop,
    setLowpass,
    setHighpass,
    setPitch,
    applyPreset,
  };
}
