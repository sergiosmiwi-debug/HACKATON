"use client";
import { useEffect, useRef, useState } from "react";
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react";

export default function AmbientPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted,   setMuted]   = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/ambient.mp3", { method: "HEAD" }).then(r => {
      if (!r.ok) return;
      const audio = new Audio("/ambient.mp3");
      audio.loop = true;
      audio.volume = 0.08;
      audioRef.current = audio;
      setVisible(true);
      audio.play().catch(() => {});
    }).catch(() => {});
    return () => { audioRef.current?.pause(); };
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (muted) {
      a.volume = 0.08;
      a.play().catch(() => {});
      setMuted(false);
    } else {
      a.volume = 0;
      setMuted(true);
    }
  }

  if (!visible) return null;

  return (
    <button
      onClick={toggle}
      title={muted ? "Activar música" : "Silenciar música"}
      style={{
        position: "fixed", bottom: 88, right: 16, zIndex: 40,
        width: 36, height: 36,
        background: "var(--surface)",
        border: "1px solid var(--border-lo)",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: muted ? "var(--ink-3)" : "var(--brand)",
        boxShadow: "var(--shadow-card)",
        cursor: "pointer",
        transition: "all 200ms ease",
      }}
    >
      {muted
        ? <SpeakerSimpleSlash size={15} weight="fill" />
        : <SpeakerSimpleHigh size={15} weight="fill" />}
    </button>
  );
}
