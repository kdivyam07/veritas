/** Compare against the incoming Host as well as Next's normalized internal URL. */
export function isSameOrigin(req: Request) {
  const value = req.headers.get("origin");
  if (!value) return false;
  try {
    const origin = new URL(value);
    const requestUrl = new URL(req.url);
    if (!["http:", "https:"].includes(origin.protocol)) return false;
    return (
      origin.origin === requestUrl.origin ||
      (origin.host === req.headers.get("host") && origin.protocol === requestUrl.protocol)
    );
  } catch {
    return false;
  }
}
