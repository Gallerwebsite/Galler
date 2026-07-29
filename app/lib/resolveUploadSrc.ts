import { API_URL } from "@/app/lib/apiUrl";

export function resolveUploadSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) {
    return `${API_URL}${src}`;
  }
  return src;
}
