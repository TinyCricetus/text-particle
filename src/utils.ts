export function invariant(value: any, msg = 'debugger point'): asserts value {
  if (typeof value !== 'boolean' && !value) {
    console.error(msg)
    throw new Error('Unexpected empty value.')
  }
}

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

export function useRAF(fn: () => void) {
  let raf = -1
  const run = () => {
    fn()

    raf = requestAnimationFrame(() => {
      run()
    })
  }

  const cancel = () => {
    cancelAnimationFrame(raf)
  }

  return [run, cancel] as const
}