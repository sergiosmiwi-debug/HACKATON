"use client";
import { useEffect } from "react";
import { initAmbient } from "@/lib/ambient";

export default function AmbientPlayer() {
  useEffect(() => { initAmbient(); }, []);
  return null;
}
