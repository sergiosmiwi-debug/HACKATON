import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function passHeaders(req: NextRequest): Record<string, string> {
  const h: Record<string, string> = {};
  const deviceId = req.headers.get("x-device-id");
  if (deviceId) h["x-device-id"] = deviceId;
  return h;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, { cache: "no-store", headers: passHeaders(req) });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join("/")}`;
  const contentType = req.headers.get("content-type") ?? "";
  let body: BodyInit;
  let forwardHeaders: Record<string, string> = { ...passHeaders(req) };
  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
    // No pasar content-type: fetch lo genera solo con el boundary correcto
  } else {
    body = await req.text();
    forwardHeaders["content-type"] = contentType;
  }
  const res = await fetch(url, { method: "POST", headers: forwardHeaders, body });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join("/")}`;
  const res = await fetch(url, { method: "DELETE", headers: passHeaders(req) });
  const data = await res.json();
  return NextResponse.json(data);
}
