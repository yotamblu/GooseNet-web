import { Composition } from "remotion";
import { GoosenetAd30 } from "./GoosenetAd30";

/** 30s commercial — 30fps, 900 frames. Horizontal for YouTube + X feed; vertical for Shorts/Reels. */
export function RemotionRoot() {
  return (
    <>
      <Composition
        id="GoosenetAd30"
        component={GoosenetAd30}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GoosenetAd30Vertical"
        component={GoosenetAd30}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
}
