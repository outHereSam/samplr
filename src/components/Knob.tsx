import {
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";

interface KnobProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function Knob({
  label,
  min,
  max,
  step = 1,
  value,
  unit,
  onChange,
}: KnobProps) {
  const [isDragging, setDragging] = useState(false);
  const pointerRef = useRef<number | null>(null);
  const previousYRef = useRef<number>(0);

  const angle = useMemo(() => {
    const range = max - min;
    const ratio = (value - min) / range;
    return ratio * 270 - 135;
  }, [value, min, max]);

  const formattedValue = useMemo(() => {
    const decimals = step < 1 ? 1 : 0;
    return `${value.toFixed(decimals)}${unit ?? ""}`;
  }, [value, step, unit]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    pointerRef.current = event.pointerId;
    previousYRef.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging || pointerRef.current !== event.pointerId) return;
    const delta = previousYRef.current - event.clientY;
    previousYRef.current = event.clientY;
    const sensitivity = (max - min) / 120;
    const nextValueRaw = value + delta * sensitivity;
    const stepped = Math.round(nextValueRaw / step) * step;
    const nextValue = clamp(Number(stepped.toFixed(3)), min, max);
    onChange(nextValue);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== event.pointerId) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    pointerRef.current = null;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      onChange(clamp(value + step, min, max));
    }
    if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      onChange(clamp(value - step, min, max));
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="knob"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={(event) => {
          if (!isDragging) return;
          event.currentTarget.releasePointerCapture(event.pointerId);
          setDragging(false);
        }}
        onKeyDown={handleKeyDown}
      >
        <div className="knob__ticks" />
        <div
          className="knob__dial"
          style={{ transform: `rotate(${angle}deg)` }}
        />
      </div>
      <span className="knob-label">{label}</span>
      <span className="text-xs font-[var(--font-code)] text-white/80">
        {formattedValue}
      </span>
    </div>
  );
}
