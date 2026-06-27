import { NextRequest, NextResponse } from "next/server";

const BACKEND = "http://localhost:8000";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join("/")}${req.nextUrl.search}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join("/")}`;
  const contentType = req.headers.get("content-type") ?? "";
  let body: BodyInit;
  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
  } else {
    body = await req.text();
  }
  const res = await fetch(url, {
    method: "POST",
    headers: contentType.includes("multipart") ? {} : { "content-type": contentType },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = `${BACKEND}/${path.join("/")}`;
  const res = await fetch(url, { method: "DELETE" });
  const data = await res.json();
  return NextResponse.json(data);
}
