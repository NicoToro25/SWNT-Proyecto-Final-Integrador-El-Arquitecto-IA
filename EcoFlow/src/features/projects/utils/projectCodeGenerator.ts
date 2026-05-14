/**
 * Genera un código de proyecto único en formato ECO-AAAA-NNNN.
 *
 * Formato:
 * - ECO: Prefijo fijo para EcoFlow
 * - AAAA: Año actual (ej: 2026)
 * - NNNN: Número secuencial de 4 dígitos (ej: 0001)
 *
 * @example
 * generateProjectCode() // "ECO-2026-0432"
 */
export function generateProjectCode(): string {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')
  return `ECO-${year}-${randomNumber}`
}
