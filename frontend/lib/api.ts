const API = "/api";

export async function getProducts() {
  try {
    const res = await fetch(`${API}/products`, { cache: "no-store" });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getDashboard() {
  const res = await fetch(`${API}/dashboard`, { cache: "no-store" });
  return res.json();
}

export async function markOpened(id: number) {
  const res = await fetch(`${API}/products/${id}/open`, { method: "POST" });
  return res.json();
}

export async function discardProduct(id: number) {
  const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
  return res.json();
}

export async function scanReceipt(file: File, phone?: string) {
  const form = new FormData();
  form.append("file", file);
  if (phone) form.append("phone", phone);
  const res = await fetch(`${API}/scan/receipt`, { method: "POST", body: form });
  return res.json();
}

export async function scanFridge(file: File, phone?: string) {
  const form = new FormData();
  form.append("file", file);
  if (phone) form.append("phone", phone);
  const res = await fetch(`${API}/scan/fridge`, { method: "POST", body: form });
  return res.json();
}

export async function addProduct(name: string, quantity: string, price: number, phone?: string) {
  const res = await fetch(`${API}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, quantity, purchase_price: price, phone }),
  });
  return res.json();
}
