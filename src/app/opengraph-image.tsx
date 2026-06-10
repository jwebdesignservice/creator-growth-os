import { ImageResponse } from "next/og";
import { BRAND_NAME } from "@/lib/brand";

/**
 * Site-wide Open Graph / social share image (1200×630), generated at the
 * edge. Pages without their own opengraph-image inherit this one, so every
 * shared link (X, LinkedIn, iMessage, Slack…) renders a branded card
 * instead of a blank preview.
 */
export const alt = `${BRAND_NAME} — Creator Growth Platform`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #FDFBF8 0%, #FAF6F2 55%, #F6E3E6 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* soft rose glow, echoing the app's cover-art surfaces */}
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(194,97,116,0.22) 0%, rgba(194,97,116,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #C26174, #B9485C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FDFBF8",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 600,
              color: "#1A1816",
              letterSpacing: "-0.5px",
            }}
          >
            {BRAND_NAME.toLowerCase()}
          </div>
        </div>
        <div
          style={{
            fontSize: "76px",
            fontWeight: 700,
            lineHeight: 1.08,
            color: "#1A1816",
            letterSpacing: "-2px",
            maxWidth: "900px",
          }}
        >
          Your platform. Your brand. Their growth.
        </div>
        <div
          style={{
            marginTop: "30px",
            fontSize: "30px",
            color: "#6B6259",
            maxWidth: "820px",
            lineHeight: 1.35,
            fontFamily: "Helvetica, Arial, sans-serif",
          }}
        >
          Programs, community, content planning and performance tracking — in
          one creator growth platform.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "10px",
            background: "linear-gradient(90deg, #C26174, #B9485C, #E8B4BE)",
          }}
        />
      </div>
    ),
    size,
  );
}
