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
        position: "fixed", top: 14, right: 16, zIndex: 50,
        width: 34, height: 34,
        background: "rgba(255,255,255,0.15)",
        border: "none",
        borderRadius: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff",
        cursor: "pointer",
        transition: "opacity 200ms ease",
      }}
    >
      {muted
        ? <SpeakerSimpleSlash size={15} />
        : <SpeakerSimpleHigh size={15} />}
    </button>
  );
}
