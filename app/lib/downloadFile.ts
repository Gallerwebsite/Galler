import { API_URL } from "@/app/lib/apiUrl";
import { resolveDownloadFileName, isPdfDownload } from "@/app/lib/resolveDownloadFileName";

function buildDownloadProxyUrl(url: string, fileName: string, disposition: "attachment" | "inline" = "attachment") {
  const resolvedName = resolveDownloadFileName(url, fileName);
  const params = new URLSearchParams({
    url,
    filename: resolvedName,
    disposition,
  });
  return `${API_URL}/api/files/download?${params.toString()}`;
}

export function getDocumentViewUrl(url: string, fileName: string) {
  return buildDownloadProxyUrl(url, fileName, "inline");
}

export async function downloadUploadedFile(url: string, fileName: string) {
  const resolvedName = resolveDownloadFileName(url, fileName);
  const proxyUrl = buildDownloadProxyUrl(url, resolvedName, "attachment");
  const response = await fetch(proxyUrl);

  if (!response.ok) {
    throw new Error("Failed to download file");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = resolvedName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export function openUploadedFile(url: string, fileName: string) {
  window.open(getDocumentViewUrl(url, fileName), "_blank", "noopener,noreferrer");
}

export async function downloadOrOpenUploadedFile(url: string, fileName: string) {
  try {
    await downloadUploadedFile(url, fileName);
  } catch {
    openUploadedFile(url, fileName);
  }
}

export { isPdfDownload, resolveDownloadFileName };
