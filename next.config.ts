import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

let uploadHost = "localhost";
let uploadProtocol: "http" | "https" = "http";
let uploadPort = "5001";

try {
  const parsed = new URL(apiUrl);
  uploadHost = parsed.hostname;
  uploadProtocol = parsed.protocol.replace(":", "") as "http" | "https";
  uploadPort = parsed.port || (uploadProtocol === "https" ? "443" : "80");
} catch {
  // keep localhost defaults
}

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const imagekitEndpointHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT
      ? new URL(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT).hostname
      : "ik.imagekit.io";
  } catch {
    return "ik.imagekit.io";
  }
})();

const uploadRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] =
  uploadHost !== "localhost"
    ? [
        {
          protocol: uploadProtocol,
          hostname: uploadHost,
          ...(uploadPort && uploadPort !== "443" && uploadPort !== "80"
            ? { port: uploadPort }
            : {}),
          pathname: "/uploads/**",
        },
      ]
    : [];

const cloudinaryRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "res.cloudinary.com",
    pathname: cloudName ? `/${cloudName}/**` : "/**",
  },
];

const imagekitRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: imagekitEndpointHost,
    pathname: "/**",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  async headers() {
    const apiHost = uploadHost !== "localhost" ? uploadHost : "localhost";
    const apiProtocol = uploadProtocol;
    const apiOrigin = `${apiProtocol}://${apiHost}${
      uploadPort && uploadPort !== "443" && uploadPort !== "80" ? `:${uploadPort}` : ""
    }`;

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              `img-src 'self' data: blob: ${apiOrigin} https://res.cloudinary.com https://${imagekitEndpointHost} https://maps.google.com https://maps.googleapis.com https://*.google.com https://*.gstatic.com`,
              "font-src 'self' data:",
              `connect-src 'self' ${apiOrigin}`,
              `media-src 'self' blob: data: https://res.cloudinary.com https://${imagekitEndpointHost}`,
              "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5001",
        pathname: "/uploads/**",
      },
      ...uploadRemotePatterns,
      ...cloudinaryRemotePatterns,
      ...imagekitRemotePatterns,
    ],
  },
};

export default nextConfig;
