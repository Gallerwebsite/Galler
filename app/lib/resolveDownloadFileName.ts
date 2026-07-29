export function resolveDownloadFileName(
  url: string,
  fileName: string,
  fallback = "download"
): string {
  const baseName = fileName.trim() || fallback;
  if (/\.[a-z0-9]+$/i.test(baseName)) {
    return baseName;
  }

  const urlPath = url.split("?")[0] ?? url;
  const match = urlPath.match(/(\.[a-z0-9]+)$/i);
  if (match?.[1]) {
    return `${baseName}${match[1].toLowerCase()}`;
  }

  return baseName;
}

export function isPdfDownload(url: string, fileName: string): boolean {
  const resolved = resolveDownloadFileName(url, fileName);
  return resolved.toLowerCase().endsWith(".pdf");
}
