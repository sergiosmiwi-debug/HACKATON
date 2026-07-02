// Singleton de audio — no se reinicia al cambiar de página
let _audio: HTMLAudioElement | null = null;
let _muted = false;
let _ready = false;

export function initAmbient() {
  if (_audio || typeof window === "undefined") return;
  fetch("/ambient.mp3", { method: "HEAD" }).then(r => {
    if (!r.ok) return;
    _audio = new Audio("/ambient.mp3");
    _audio.loop = true;
    _audio.volume = 0.08;
    _ready = true;
    _audio.play().catch(() => {});
    window.dispatchEvent(new CustomEvent("ambient-ready"));
  }).catch(() => {});
}

export function toggleAmbient() {
  if (!_audio) return;
  _muted = !_muted;
  _audio.volume = _muted ? 0 : 0.08;
  if (!_muted) _audio.play().catch(() => {});
  window.dispatchEvent(new CustomEvent("ambient-change", { detail: { muted: _muted } }));
}

export function isAmbientMuted() { return _muted; }
export function isAmbientReady() { return _ready; }
