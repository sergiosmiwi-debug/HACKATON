"use client";
import { useEffect, useState } from "react";
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react";
import { toggleAmbient, isAmbientMuted, isAmbientReady } from "@/lib/ambient";

export default function MusicButton() {
  const [muted,  setMuted]  = useState(false);
  const [ready,  setReady]  = useState(false);

  useEffect(() => {
    setReady(isAmbientReady());
    const onReady  = () => setReady(true);
    const onChange = (e: Event) => setMuted((e as CustomEvent).detail.muted);
    window.addEventListener("ambient-ready",  onReady);
    window.addEventListener("ambient-change", onChange);
    return () => {
      window.removeEventListener("ambient-ready",  onReady);
      window.removeEventListener("ambient-change", onChange);
    };
  }, []);

  if (!ready) return null;

  return (
    <button
      onClick={toggleAmbient}
      title={muted ? "Activar música" : "Silenciar música"}
      className="active:scale-[0.95]"
      style={{
        width: 34, height: 34,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff",
        background: "rgba(255,255,255,0.15)",
        border: "none", borderRadius: 10, cursor: "pointer",
      }}
    >
      {muted
        ? <SpeakerSimpleSlash size={15} />
        : <SpeakerSimpleHigh size={15} />}
    </button>
  );
}
