import { getBin } from "./recycling";

const STORAGE_KEY = "qr_notified_ids";
const CHECK_GAP_MS = 1000 * 60 * 60 * 6; // no repetir antes de 6h
const LAST_CHECK_KEY = "qr_last_notify_check";

type Product = {
  id: number; name: string; days_left: number | null;
};

export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!canNotify()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function getNotifiedIds(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch { return new Set(); }
}

function saveNotifiedIds(ids: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function checkExpiringAndNotify(products: Product[]) {
  if (!canNotify() || Notification.permission !== "granted") return;

  const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || "0");
  const now = Date.now();
  if (now - lastCheck < CHECK_GAP_MS) return;
  localStorage.setItem(LAST_CHECK_KEY, String(now));

  const notified = getNotifiedIds();
  const expiring = products.filter(p => p.days_left !== null && p.days_left <= 2 && p.days_left >= 0 && !notified.has(p.id));

  expiring.forEach((p, i) => {
    setTimeout(() => {
      const bin = getBin(p.name);
      const when = p.days_left === 0 ? "hoy" : p.days_left === 1 ? "mañana" : `en ${p.days_left} días`;
      const body = bin
        ? `Vence ${when}. Si lo desechas, va en: ${bin.bin} (${bin.tip.split("→")[1]?.trim() ?? bin.bin}).`
        : `Vence ${when}. Úsalo pronto para no desperdiciarlo.`;
      new Notification(`🍃 ${p.name} está por vencer`, {
        body,
        icon: "/next.svg",
        tag: `qr-expiry-${p.id}`,
      });
      notified.add(p.id);
      saveNotifiedIds(notified);
    }, i * 700);
  });
}

export function clearNotifiedId(id: number) {
  const notified = getNotifiedIds();
  notified.delete(id);
  saveNotifiedIds(notified);
}
