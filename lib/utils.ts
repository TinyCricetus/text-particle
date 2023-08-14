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

export function useRequestAnimationFrame(callback: (costTime: number) => void) {
  let id = -1

  const runRAF = (costTime: number) => {
    if (id >= 0) {
      // Prevent multiple executions of the run function
      cancelRAF()
    }

    callback(costTime)

    id = requestAnimationFrame(time => {
      runRAF(time)
    })
  }

  const cancelRAF = () => {
    cancelAnimationFrame(id)
    id = -1
  }

  return [runRAF, cancelRAF] as const
}