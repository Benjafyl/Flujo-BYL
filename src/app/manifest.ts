import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FLUJO BYL",
    short_name: "FLUJO",
    description:
      "Dashboard personal para controlar ingresos, egresos y presupuesto con captura rápida.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4efe6",
    theme_color: "#0c7c59",
    lang: "es-CL",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
