import type { MetadataRoute } from "next";

// Web app manifest: name and icons from the logo package (design/assets/brand).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Little Brain Crew",
    short_name: "Brain Crew",
    description: "Short cartoon explainers for parents of kids 3–17: the brain chemicals, brain parts and habits behind everyday moments.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF4",
    theme_color: "#FF5A36",
    icons: [
      { src: "/assets/brand/lbc-app-icon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/assets/brand/lbc-app-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/assets/brand/lbc-app-icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
  };
}
