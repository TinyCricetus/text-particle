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

export function transformHexStrToRGBA(color: string) {
  if (!color.startsWith('#')) {
    throw new Error('Error color style')
  }

  color = color.substring(1)

  // ensure correct length
  if (color.length === 3) {
    const [r, g, b] = color
    color = r + r + g + g + b + b
  }

  if (color.length !== 6) {
    throw new Error('Error color style')
  }

  const rgb: number[] = []
  for (let i = 0; i < 6; i += 2) {
    rgb.push(Number.parseInt(color[i] + color[i + 1], 16))
  }

  // A default to 255
  rgb.push(255)

  return rgb
}