export function normalizeCategoryInput(value: string, existingOptions: string[] = []) {
  const normalized = value.trim().replace(/\s+/g, " ")
  if (!normalized) {
    return ""
  }

  const existingMatch = existingOptions.find(
    (option) => option.trim().toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR")
  )

  return existingMatch ?? normalized
}
