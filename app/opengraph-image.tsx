import { ImageResponse } from "next/og";

export const alt = "GooseNet - Train Smarter. Run Stronger. Together.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Train Smarter. Run Stronger.
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "rgba(255,255,255,0.95)",
              marginTop: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Together.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.85)",
              marginTop: 32,
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            GooseNet connects runners and coaches through structured workouts,
            real performance data, and seamless Garmin integration.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
