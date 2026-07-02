"use client";
import { useEffect, useRef, useState } from "react";
import { MusicNote, MusicNotesSimple, SpeakerSlash } from "@phosphor-icons/react";

export default function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted,   setMuted]   = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const audio = new Audio("/ambient.mp3");
    audio.loop = true;
    audio.volume = 0.08;
    audioRef.current = audio;

    fetch("/ambient.mp3", { method: "HEAD" }).then(r => {
      if (r.ok) setVisible(true);
    }).catch(() => {});

    return () => { audio.pause(); audio.src = ""; };
  }, []);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      setMuted(false);
      a.volume = 0.08;
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function toggleMute() {
    const a = audioRef.current;
    if (!a || !playing) return;
    const next = !muted;
    a.volume = next ? 0 : 0.08;
    setMuted(next);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 88, right: 16, zIndex: 40,
      display: "flex", flexDirection: "column", gap: 6, alignItems: "center",
    }}>
      {/* Botón silenciar — solo aparece cuando está sonando */}
      {playing && (
        <button
          onClick={toggleMute}
          title={muted ? "Activar sonido" : "Silenciar"}
          style={{
            width: 34, height: 34,
            background: muted ? "var(--danger-bg)" : "var(--surface)",
            border: "1px solid var(--border-lo)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: muted ? "var(--danger-txt)" : "var(--ink-3)",
            boxShadow: "var(--shadow-card)",
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
        >
          <SpeakerSlash size={15} weight={muted ? "fill" : "regular"} />
        </button>
      )}

      {/* Botón play/stop */}
      <button
        onClick={togglePlay}
        title={playing ? "Detener música" : "Música ambiente"}
        style={{
          width: 38, height: 38,
          background: playing ? "var(--brand)" : "var(--surface)",
          border: "1px solid var(--border-lo)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: playing ? "#fff" : "var(--ink-3)",
          boxShadow: "var(--shadow-card)",
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
      >
        {playing
          ? <MusicNotesSimple size={16} weight="fill" />
          : <MusicNote size={16} />}
      </button>
    </div>
  );
}
