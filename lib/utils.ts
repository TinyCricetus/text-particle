const MAX_RANGE = 10000
const MIN_RANGE = 1

export function randomChange(value: number, range = 10) {
  range = Math.floor(range)
  range = Math.max(range, MIN_RANGE)
  range = Math.min(range, MAX_RANGE)

  const prefixSign = Math.random() > 0.5 ? 1 : -1
  const changeValue = Math.floor(Math.random() * 100000) % range

  return value + prefixSign * changeValue
}