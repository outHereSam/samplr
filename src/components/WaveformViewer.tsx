import { useEffect, useRef } from "react";

interface WaveformViewerProps {
  data: number[];
  hasSample: boolean;
}

export function WaveformViewer({ data, hasSample }: WaveformViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.clientWidth * window.devicePixelRatio;
    const height = canvas.clientHeight * window.devicePixelRatio;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(94,244,255,0.9)";
    ctx.fillStyle = "rgba(94,244,255,0.08)";
    ctx.lineWidth = 2;

    if (!data.length) {
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    const step = width / data.length;
    const centerY = height / 2;

    ctx.beginPath();
    data.forEach((value, index) => {
      const x = index * step;
      const y = centerY - value * centerY;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    data.forEach((value, index) => {
      const x = index * step;
      const y = centerY + value * centerY;
      ctx.lineTo(x, y);
    });
    ctx.lineTo(width, centerY);
    ctx.closePath();
    ctx.fill();
  }, [data]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="section-title">Waveform</p>
        {!hasSample && (
          <span className="text-xs text-white/40">Awaiting sample</span>
        )}
      </div>
      <canvas ref={canvasRef} className="waveform-canvas" />
    </div>
  );
}
