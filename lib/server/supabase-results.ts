export function firstRow<T>(data: T[] | null | undefined) {
  return data?.[0] ?? null
}
