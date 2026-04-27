import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0d10",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "#c4b5fd",
            display: "flex",
            boxShadow:
              "0 0 0 14px rgba(196, 181, 253, 0.18), 0 0 0 32px rgba(196, 181, 253, 0.08)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
