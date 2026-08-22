export function normalizeDocument(value: string) {
  return value.replace(/\D/g, '')
}

function hasRepeatedDigits(value: string) {
  return /^(\d)\1+$/.test(value)
}

export function isValidCpf(value: string) {
  const digits = normalizeDocument(value)
  if (digits.length !== 11 || hasRepeatedDigits(digits)) return false

  const calculateDigit = (length: number) => {
    const sum = digits
      .slice(0, length)
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0)
    const remainder = (sum * 10) % 11
    return remainder === 10 ? 0 : remainder
  }

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10])
}

export function isValidCnpj(value: string) {
  const digits = normalizeDocument(value)
  if (digits.length !== 14 || hasRepeatedDigits(digits)) return false

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = base
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  const first = calculateDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = calculateDigit(
    `${digits.slice(0, 12)}${first}`,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  )
  return first === Number(digits[12]) && second === Number(digits[13])
}

export function isValidRuralDocument(type: 'CPF' | 'CNPJ', value: string) {
  return type === 'CPF' ? isValidCpf(value) : isValidCnpj(value)
}
