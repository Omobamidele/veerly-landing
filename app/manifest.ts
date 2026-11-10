import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Veerly — Remote Career Accelerator",
    short_name: "Veerly",
    description: "A personalized operating system for building, navigating and growing your remote career.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafb",
    theme_color: "#0075AD",
    icons: [
      { src: "/icons/veerly-app-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/veerly-app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
