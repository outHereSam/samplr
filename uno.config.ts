import {
  defineConfig,
  presetIcons,
  presetTypography,
  presetWind4,
} from "unocss";

export default defineConfig({
  theme: {
    colors: {
      night: "#070b18",
      charcoal: "#161b2c",
      neon: "#5ef4ff",
      amber: "#ffb347",
      danger: "#ff5f6d",
    },
    fontFamily: {
      display:
        'Space Grotesk, "IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      ui: 'JetBrains Mono, "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
  },
  shortcuts: {
    "glass-panel":
      "rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl shadow-[0_25px_60px_-25px_rgba(0,0,0,0.7)]",
    "section-title":
      "font-semibold tracking-[0.2em] text-xs uppercase text-white/60",
    "knob-label": "text-xs uppercase tracking-wide text-white/60",
  },
  presets: [presetWind4(), presetIcons(), presetTypography()],
});
