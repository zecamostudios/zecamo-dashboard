/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint:     { ignoreDuringBuilds: true },
  async headers() {
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
      : "*.supabase.co";

    const csp = [
      "default-src 'self'",
      // Next.js requires 'unsafe-inline' for hydration scripts
      "script-src 'self' 'unsafe-inline'",
      // Tailwind and shadcn/ui use inline styles
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
      // Recharts and avatars may use data URIs
      "img-src 'self' data: blob:",
      "font-src 'self'",
      // No plugins, no base-tag injection
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Content-Security-Policy", value: csp },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
