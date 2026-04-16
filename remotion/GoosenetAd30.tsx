import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/** Matches GooseNet marketing palette (dark-first) — see COLOR_GUIDELINES.md */
const C = {
  bg: "#111827",
  card: "#1f2937",
  border: "#374151",
  text: "#f3f4f6",
  muted: "#9ca3af",
  sub: "#d1d5db",
  blue: "#3b82f6",
  blueDeep: "#2563eb",
  purple: "#a855f7",
  purpleDeep: "#9333ea",
};

const SITE = "goosenet.space";

/** Scene ranges (inclusive end), 30s @ 30fps = 900 frames (0..899) */
const SCENE_ENDS = [119, 239, 359, 479, 599, 719, 809, 899] as const;

function sceneOpacity(frame: number, scene: number, fadeIn = 14): number {
  const start = scene === 0 ? 0 : SCENE_ENDS[scene - 1] + 1;
  const end = SCENE_ENDS[scene];
  if (frame < start || frame > end) return 0;
  const fin = interpolate(frame, [start, start + fadeIn], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (scene === SCENE_ENDS.length - 1) {
    const fout = interpolate(frame, [end - 12, end], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return fin * fout;
  }
  return fin;
}

function GlowBackdrop() {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: -120,
          left: -120,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "rgba(168, 85, 247, 0.22)",
          filter: "blur(90px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 440,
          height: 440,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.2)",
          filter: "blur(80px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -140,
          right: -100,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "rgba(236, 72, 153, 0.12)",
          filter: "blur(95px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.16)",
          filter: "blur(85px)",
        }}
      />
    </AbsoluteFill>
  );
}

function Caption({
  text,
  scale,
  bottom = 56,
}: {
  text: string;
  scale: number;
  bottom?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 48 * scale,
        right: 48 * scale,
        bottom,
        textAlign: "center",
        color: C.sub,
        fontSize: 34 * scale,
        fontWeight: 600,
        lineHeight: 1.35,
        textShadow: "0 2px 24px rgba(0,0,0,0.45)",
      }}
    >
      {text}
    </div>
  );
}

function BrowserChrome({ scale }: { scale: number }) {
  return (
    <div
      style={{
        height: 44 * scale,
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        paddingLeft: 16 * scale,
        gap: 10 * scale,
        background: "#0f172a",
      }}
    >
      <div style={{ display: "flex", gap: 8 * scale }}>
        {["#ef4444", "#eab308", "#22c55e"].map((c) => (
          <div
            key={c}
            style={{
              width: 12 * scale,
              height: 12 * scale,
              borderRadius: "50%",
              background: c,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          marginLeft: 12 * scale,
          marginRight: 12 * scale,
          height: 28 * scale,
          borderRadius: 8 * scale,
          background: C.card,
          border: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 14 * scale,
          color: C.muted,
          fontSize: 15 * scale,
        }}
      >
        {SITE}
      </div>
    </div>
  );
}

function Headline({
  children,
  size,
  gradientWord,
}: {
  children: string;
  size: number;
  gradientWord?: string;
}) {
  if (!gradientWord) {
    return (
      <div
        style={{
          fontSize: size,
          fontWeight: 800,
          color: C.text,
          letterSpacing: -1.5,
          lineHeight: 1.05,
          textAlign: "center",
        }}
      >
        {children}
      </div>
    );
  }
  const parts = children.split(gradientWord);
  return (
    <div
      style={{
        fontSize: size,
        fontWeight: 800,
        color: C.text,
        letterSpacing: -1.5,
        lineHeight: 1.05,
        textAlign: "center",
      }}
    >
      {parts[0]}
      <span
        style={{
          background: `linear-gradient(90deg, ${C.blueDeep}, ${C.purpleDeep}, ${C.blueDeep})`,
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        {gradientWord}
      </span>
      {parts[1] ?? ""}
    </div>
  );
}

export function GoosenetAd30() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  const scale = portrait ? width / 1080 : width / 1920;
  const pad = 64 * scale;
  const headlineSize = (portrait ? 62 : 76) * scale;
  const subSize = (portrait ? 30 : 34) * scale;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: "system-ui, sans-serif" }}>
      <GlowBackdrop />

      {/* Scene 0 — hook / pattern interrupt */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 0), padding: pad }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Headline size={headlineSize * 1.05}>Coaching shouldn&apos;t start with a paywall.</Headline>
          <p
            style={{
              marginTop: 28 * scale,
              textAlign: "center",
              color: C.sub,
              fontSize: subSize,
              maxWidth: portrait ? "100%" : 1200 * scale,
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.45,
            }}
          >
            GooseNet helps runners and coaches connect, plan, and train with structured workouts and real performance data.
          </p>
        </div>
        <Caption text="Built for real coaching workflows—not generic fitness noise." scale={scale} />
      </AbsoluteFill>

      {/* Scene 1 — core promise */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 1), padding: pad }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              fontSize: headlineSize,
              fontWeight: 800,
              letterSpacing: -1.5,
              lineHeight: 1.05,
              textAlign: "center",
            }}
          >
            <span style={{ color: C.text }}>The best place for coaches and athletes to </span>
            <span
              style={{
                background: `linear-gradient(90deg, ${C.blueDeep}, ${C.purpleDeep}, ${C.blueDeep})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              connect
            </span>
            <span style={{ color: C.text }}>.</span>
          </div>
          <p
            style={{
              marginTop: 24 * scale,
              textAlign: "center",
              color: C.muted,
              fontSize: subSize * 0.95,
            }}
          >
            Structured workouts · Coach–athlete collaboration · Garmin-powered insights
          </p>
        </div>
        <Caption text="Pair fast—then assign workouts, sync Garmin, and review real metrics." scale={scale} />
      </AbsoluteFill>

      {/* Scene 2 — pain / contrast */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 2), padding: pad }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 * scale }}>
          <Headline size={headlineSize * 0.92}>Stop losing momentum between sessions.</Headline>
          <div
            style={{
              display: "flex",
              flexDirection: portrait ? "column" : "row",
              gap: 20 * scale,
              justifyContent: "center",
              marginTop: 8 * scale,
            }}
          >
            {["Scattered screenshots", "Lost messages", "No single source of truth"].map((t) => (
              <div
                key={t}
                style={{
                  flex: 1,
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16 * scale,
                  padding: 22 * scale,
                  color: C.muted,
                  fontSize: 26 * scale,
                  textAlign: "center",
                  textDecoration: "line-through",
                  opacity: 0.9,
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        <Caption text="Replace the chaos with one structured workspace." scale={scale} />
      </AbsoluteFill>

      {/* Scene 3 — product glimpse (real site asset) */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 3), padding: pad }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 20 * scale,
          }}
        >
          <Headline size={headlineSize * 0.78} gradientWord="Together.">
            {"Train Smarter. Run Stronger. Together."}
          </Headline>
          <div
            style={{
              width: "100%",
              maxWidth: portrait ? width - pad * 2 : 1500 * scale,
              borderRadius: 18 * scale,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
              boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
              background: "#0b1220",
            }}
          >
            <BrowserChrome scale={scale} />
            <div style={{ position: "relative", background: C.bg }}>
              <Img
                src={staticFile("preview.png")}
                style={{
                  width: "100%",
                  display: "block",
                  transform: `scale(${interpolate(frame, [360, 479], [1, 1.04], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}
              />
            </div>
          </div>
        </div>
        <Caption text="Same look and feel as the live product — dark, fast, focused." scale={scale} />
      </AbsoluteFill>

      {/* Scene 4 — mechanism / chips */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 4), padding: pad }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Headline size={headlineSize * 0.88}>One place to stay aligned.</Headline>
          <div
            style={{
              marginTop: 36 * scale,
              display: "flex",
              flexDirection: portrait ? "column" : "row",
              flexWrap: "wrap",
              gap: 18 * scale,
              justifyContent: "center",
            }}
          >
            {[
              { t: "Assign structured running workouts", k: "Plans" },
              { t: "Sync and review on Garmin data", k: "Garmin" },
              { t: "Share clean summaries with your coach", k: "Insights" },
            ].map((x) => (
              <div
                key={x.k}
                style={{
                  minWidth: portrait ? "100%" : 280 * scale,
                  flex: portrait ? undefined : 1,
                  background: `linear-gradient(135deg, rgba(37,99,235,0.2), rgba(147,51,234,0.18))`,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16 * scale,
                  padding: 24 * scale,
                }}
              >
                <div style={{ color: C.blue, fontWeight: 700, fontSize: 22 * scale, marginBottom: 8 * scale }}>{x.k}</div>
                <div style={{ color: C.text, fontSize: 26 * scale, lineHeight: 1.35 }}>{x.t}</div>
              </div>
            ))}
          </div>
        </div>
        <Caption text="Designed for performance — not generic fitness noise." scale={scale} />
      </AbsoluteFill>

      {/* Scene 5 — connect flow mock (coach code ↔ athlete) */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 5), padding: pad }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Headline size={headlineSize * 0.82}>Pair in seconds. Train for real.</Headline>
          <div
            style={{
              marginTop: 28 * scale,
              display: "flex",
              flexDirection: portrait ? "column" : "row",
              gap: 22 * scale,
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                flex: 1,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16 * scale,
                padding: 24 * scale,
              }}
            >
              <div style={{ color: C.muted, fontSize: 20 * scale, fontWeight: 600, marginBottom: 10 * scale }}>Coach</div>
              <div style={{ color: C.text, fontSize: 28 * scale, fontWeight: 700 }}>Share your coach code</div>
              <div
                style={{
                  marginTop: 16 * scale,
                  padding: 14 * scale,
                  borderRadius: 12 * scale,
                  background: "#0f172a",
                  border: `1px dashed ${C.purple}`,
                  color: C.sub,
                  fontSize: 24 * scale,
                  letterSpacing: 2,
                  textAlign: "center",
                }}
              >
                GOOSE-7K2M
              </div>
            </div>
            <div
              style={{
                flex: 1,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16 * scale,
                padding: 24 * scale,
              }}
            >
              <div style={{ color: C.muted, fontSize: 20 * scale, fontWeight: 600, marginBottom: 10 * scale }}>Athlete</div>
              <div style={{ color: C.text, fontSize: 28 * scale, fontWeight: 700 }}>Enter your coach&apos;s code</div>
              <div
                style={{
                  marginTop: 16 * scale,
                  height: 52 * scale,
                  borderRadius: 12 * scale,
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                }}
              />
              <div
                style={{
                  marginTop: 14 * scale,
                  height: 48 * scale,
                  borderRadius: 12 * scale,
                  background: `linear-gradient(90deg, ${C.blueDeep}, ${C.purpleDeep})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 22 * scale,
                }}
              >
                Connect with Coach
              </div>
            </div>
          </div>
        </div>
        <Caption text="From coach code to structured training—without the screenshot chaos." scale={scale} />
      </AbsoluteFill>

      {/* Scene 6 — CTA */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 6), padding: pad }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 28 * scale,
          }}
        >
          <Headline size={headlineSize}>Ready to train with purpose?</Headline>
          <div
            style={{
              padding: `${28 * scale}px ${56 * scale}px`,
              borderRadius: 16 * scale,
              background: `linear-gradient(90deg, ${C.blueDeep}, ${C.purpleDeep}, ${C.blueDeep})`,
              color: "#fff",
              fontSize: 36 * scale,
              fontWeight: 800,
              boxShadow: "0 24px 80px rgba(147, 51, 234, 0.35)",
            }}
          >
            Join GooseNet
          </div>
          <div style={{ color: C.muted, fontSize: 28 * scale }}>{SITE}</div>
        </div>
        <Caption text="Create your account and pair with your coach today." scale={scale} />
      </AbsoluteFill>

      {/* Scene 7 — end card */}
      <AbsoluteFill style={{ opacity: sceneOpacity(frame, 7), padding: pad }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 18 * scale,
          }}
        >
          <div
            style={{
              fontSize: 72 * scale,
              fontWeight: 900,
              letterSpacing: -2,
              background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            GooseNet
          </div>
          <div style={{ color: C.sub, fontSize: 32 * scale, textAlign: "center", maxWidth: 900 * scale, lineHeight: 1.4 }}>
            Train Smarter. Run Stronger.{" "}
            <span style={{ color: C.text, fontWeight: 700 }}>Together.</span>
          </div>
          <div style={{ color: C.muted, fontSize: 26 * scale }}>{SITE}</div>
        </div>
      </AbsoluteFill>

    </AbsoluteFill>
  );
}
