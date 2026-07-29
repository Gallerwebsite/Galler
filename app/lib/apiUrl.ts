/** Local: .env.local → localhost. Production: .env.production → Render URL. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
