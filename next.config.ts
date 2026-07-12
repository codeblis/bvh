import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', 'resend'],
  images: {
    unoptimized: true, // Cloudflare Workers no soporta la optimización nativa de <Image>
  },
};

initOpenNextCloudflareForDev();

export default nextConfig;