import { ImageResponse } from "next/og";

export const alt = "RapidReach — Developer Intelligence";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f3f0e9",
        color: "#111111",
        padding: "64px 72px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        <span>RapidReach</span>
        <span style={{ color: "#6f6b64" }}>Developer intelligence</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
        <div style={{ fontSize: 82, lineHeight: 0.98, fontWeight: 700, letterSpacing: "-0.055em" }}>Know what changed.</div>
        <div style={{ fontSize: 82, lineHeight: 0.98, fontWeight: 700, letterSpacing: "-0.055em", fontStyle: "italic" }}>Know what matters.</div>
        <div style={{ marginTop: 34, fontSize: 27, lineHeight: 1.35, color: "#55514b", maxWidth: 900 }}>AI engineering · developer tools · cloud native · open source · software building</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #111111", paddingTop: 22, fontSize: 22 }}>
        <span>Signal before volume.</span>
        <span>rapidreach.dev</span>
      </div>
    </div>,
    size,
  );
}
