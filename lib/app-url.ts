const DEFAULT_APP_URL = "https://pulsedesk.app"

export function getAppUrl(fallbackOrigin?: string) {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    fallbackOrigin ||
    DEFAULT_APP_URL
  ).replace(/\/$/, "")
}

export function getClientAppUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : DEFAULT_APP_URL)

  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
}
