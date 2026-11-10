/** @type {import('next').NextConfig} */
const NOTION_FRAME_ANCESTORS =
  "frame-ancestors 'self' https://*.notion.so https://*.notion.site https://app.notion.com https://notion.so";

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      // Everything except /coach: no third-party framing.
      {
        source: "/:path((?!coach(?:/|$)).*)",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      // /coach is built to be embedded in Notion pages (/embed).
      {
        source: "/coach",
        headers: [{ key: "Content-Security-Policy", value: NOTION_FRAME_ANCESTORS }],
      },
      {
        source: "/coach/:path*",
        headers: [{ key: "Content-Security-Policy", value: NOTION_FRAME_ANCESTORS }],
      },
    ];
  },
};
export default nextConfig;
