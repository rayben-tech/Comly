export function isPrivateUrl(urlString: string): boolean {
  try {
    const { hostname, protocol } = new URL(urlString);
    if (!["http:", "https:"].includes(protocol)) return true;
    if (/^(localhost|.*\.local)$/i.test(hostname)) return true;
    const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4) {
      const [a, b] = [Number(ipv4[1]), Number(ipv4[2])];
      if (a === 0) return true;
      if (a === 10) return true;
      if (a === 127) return true;
      if (a === 169 && b === 254) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 100 && b >= 64 && b <= 127) return true;
    }
    if (["::1", "[::1]"].includes(hostname) || hostname.toLowerCase().startsWith("fe80:")) return true;
    return false;
  } catch {
    return true;
  }
}
