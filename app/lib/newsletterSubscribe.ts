import { API_URL } from "@/app/lib/apiUrl";

export type NewsletterSource = "footer" | "careers-talent-network";

export async function subscribeToNewsletter(email: string, source: NewsletterSource): Promise<string> {
  const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data.message || "Thanks for subscribing!";
}
