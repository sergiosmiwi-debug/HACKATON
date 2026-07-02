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

export async function getDashboard(period: "today" | "week" | "month" | "all" = "week") {
  const res = await fetch(`${API}/dashboard?period=${period}`, {
    cache: "no-store",
    headers: formHeaders(),
  });
  return res.json();
}

export async function resetWaste() {
  const res = await fetch(`${API}/dashboard/reset`, {
    method: "DELETE",
    headers: formHeaders(),
  });
  return res.json();
}

export async function removeWasteEntry(id: number) {
  const res = await fetch(`${API}/dashboard/waste/${id}`, {
    method: "DELETE",
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

export async function consumeProduct(id: number) {
  const res = await fetch(`${API}/products/${id}/consume`, {
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

export async function scanImage(file: File, mode: "receipt" | "fridge" = "receipt") {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/scan/${mode}`, {
    method: "POST",
    headers: { "X-Device-Id": getDeviceId() },
    body: form,
  });
  return res.json();
}

export async function addProduct(name: string, quantity: string, price: number, material?: string | null, category?: string) {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, purchase_price: price, device_id: getDeviceId(), material: material ?? null, category: category ?? "otros" }),
  });
  return res.json();
}

export async function setProductMaterial(id: number, material: string) {
  const res = await fetch(`${API}/products/${id}/material`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ material }),
  });
  return res.json();
}
