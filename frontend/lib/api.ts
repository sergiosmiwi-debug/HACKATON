const API = "/api";

/* ── Device ID (persiste en localStorage para aislar usuarios) ── */
function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("qr_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("qr_device_id", id);
  }
  return id;
}

function headers(extra?: Record<string, string>) {
  return { "X-Device-Id": getDeviceId(), "Content-Type": "application/json", ...extra };
}

function formHeaders() {
  return { "X-Device-Id": getDeviceId() };
}

/* ── Productos ── */
export async function getProducts() {
  try {
    const res = await fetch(`${API}/products`, {
      cache: "no-store",
      headers: formHeaders(),
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getDashboard() {
  const res = await fetch(`${API}/dashboard`, {
    cache: "no-store",
    headers: formHeaders(),
  });
  return res.json();
}

export async function markOpened(id: number) {
  const res = await fetch(`${API}/products/${id}/open`, {
    method: "POST",
    headers: formHeaders(),
  });
  return res.json();
}

export async function discardProduct(id: number) {
  const res = await fetch(`${API}/products/${id}`, {
    method: "DELETE",
    headers: formHeaders(),
  });
  return res.json();
}

export async function scanImage(file: File, phone?: string) {
  const form = new FormData();
  form.append("file", file);
  if (phone) form.append("phone", phone);
  form.append("device_id", getDeviceId());
  const res = await fetch(`${API}/scan/receipt`, { method: "POST", body: form });
  return res.json();
}

export async function addProduct(name: string, quantity: string, price: number, phone?: string) {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, purchase_price: price, phone, device_id: getDeviceId() }),
  });
  return res.json();
}
