import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  label?: string;
  fileName?: string;
  isLoading?: boolean;
  onFiles: (files: FileList) => void;
}

export function DropZone({
  label = "Drop audio here",
  fileName,
  isLoading = false,
  onFiles,
}: DropZoneProps) {
  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files.length) return;
      onFiles(files);
    },
    [onFiles]
  );

  const handleSelect = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const baseClass = [
    "dropzone",
    "glass-panel",
    "p-6",
    "lg:p-8",
    "transition-all",
    "duration-150",
  ].join(" ");
  const className = isActive ? `${baseClass} dropzone--active` : baseClass;

  return (
    <div
      className={className}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsActive(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsActive(false);
        handleFiles(event.dataTransfer?.files ?? null);
      }}
      onClick={handleSelect}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div className="flex flex-col gap-2 items-center">
        <p className="section-title">{label}</p>
        {fileName ? (
          <p className="text-base font-medium text-white/90">{fileName}</p>
        ) : (
          <p className="text-base font-medium text-white/70">
            Drag & drop or click to load
          </p>
        )}
        <p className="text-xs text-white/40 font-[var(--font-code)]">
          {isLoading ? "Decoding sample…" : "Supported: WAV, MP3, FLAC, AIFF"}
        </p>
      </div>
    </div>
  );
}
