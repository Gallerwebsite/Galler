/**
 * Keep-alive ping for the Render API so free-tier instances stay warm.
 * Scheduled every 5 minutes via the Render cron service in render.yaml.
 */
function resolveUrl() {
  if (process.env.KEEP_ALIVE_URL) return process.env.KEEP_ALIVE_URL;
  if (process.env.RENDER_EXTERNAL_URL) {
    return `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "")}/api/health`;
  }
  return "https://galler-lokb.onrender.com/api/health";
}

async function main() {
  const url = resolveUrl();
  console.log(`Pinging ${url}`);
  const res = await fetch(url, { method: "GET", signal: AbortSignal.timeout(20000) });
  const text = await res.text();
  console.log(`Status ${res.status}: ${text.slice(0, 200)}`);
  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
