import { ImageResponse } from "next/og";
import { OgPreview1200 } from "@/lib/og-brand";

export const runtime = "edge";

export const alt = "NERV — GTM Intelligence OS para Fintech Latam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(<OgPreview1200 />, { ...size });
}
