import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "German Gym Bros — Your AI fitness programming assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const antigravitySrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/antigravity.png"),
).toString("base64")}`;

const claudeCodeSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/claude-code.png"),
).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "90px",
          background:
            "linear-gradient(135deg, #22281f 0%, #2d3528 60%, #394d26 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "999px",
              background: "#a3c46b",
            }}
          />
          <div style={{ fontSize: "38px", letterSpacing: "0.08em", opacity: 0.85 }}>
            GERMAN GYM BROS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              fontSize: "112px",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Train smarter.
          </div>
          <div style={{ fontSize: "52px", opacity: 0.85 }}>
            Your AI fitness programming assistant.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            fontSize: "40px",
            opacity: 0.85,
          }}
        >
          <span style={{ whiteSpace: "nowrap" }}>Built with</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={antigravitySrc} alt="Google Antigravity" height={50} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={claudeCodeSrc} alt="Claude Code" height={50} />
        </div>
      </div>
    ),
    { ...size },
  );
}
