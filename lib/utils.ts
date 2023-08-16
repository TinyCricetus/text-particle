export function distance(x1: number, y1: number, x2: number, y2: number) {
  const x = Math.abs(x1 - x2)
  const y = Math.abs(y1 - y2)

  return Math.floor(Math.sqrt(x * x + y * y))
}

/**
 * 
 * @param t cost time
 * @param d duration time
 * @param p particle
 * @returns 
 */
export function ease(t: number, d: number, s: number, e: number) {
  if (t >= d) {
    return e
  }

  const x = t / d
  // const y = -x * x + 2 * x
  const y = -x * x + 2 * x

  return s + (e - s) * y
}

export function isApproximateEqual(a: number, b: number) {
  return Math.abs(a - b) <= 1.0
}