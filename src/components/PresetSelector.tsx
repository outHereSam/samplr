import type { SamplerPreset } from "../hooks/useSamplerEngine";

interface PresetSelectorProps {
  presets: SamplerPreset[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PresetSelector({
  presets,
  selectedId,
  onSelect,
}: PresetSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="section-title">Presets</p>
      <div className="flex flex-col gap-3">
        {presets.map((preset) => {
          const isActive = preset.id === selectedId;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelect(preset.id)}
              className={[
                "text-left rounded-2xl px-4 py-3 transition-all border",
                isActive
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/5 bg-white/0 text-white/70 hover:border-white/20 hover:bg-white/5",
              ].join(" ")}
            >
              <p className="text-sm font-semibold">{preset.name}</p>
              <p className="text-xs text-white/60">{preset.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
