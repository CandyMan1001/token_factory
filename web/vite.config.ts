import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/token_factory/" : "/",
  plugins: [react()],
  preview: {
    allowedHosts: true,
  },
});
