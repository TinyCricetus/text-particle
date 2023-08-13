import { randomChange } from './utils'

export interface Position {
  x: number
  y: number
}

export interface ParticleConfig {
  root: HTMLElement | HTMLCanvasElement
  text: string
  /** Example: 'bold 50px Microsoft YaHei' */
  font: string

  color?: string
  stay?: number
  changeRange?: number
  width?: number
  height?: number
}

enum ChangeDirection {
  Positive,
  Negative
}

export async function render(config: ParticleConfig) {
  const {
    root,
    text,
    font,
    color = '#333333'
  } = config

  let width = 200
  let height = 100

  let canvas: HTMLCanvasElement
  if (root instanceof HTMLCanvasElement) {
    canvas = root
    width = canvas.width
    height = canvas.height
  } else {
    canvas = document.createElement('canvas')
    root.appendChild(canvas)
  }

  if (config.width) {
    width = config.width
  }

  if (config.height) {
    height = config.height
  }

  canvas.width = 200
  canvas.height = 100

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.warn('Platform does not support canvas 2d.')
    return
  }

  function clearCanvas() {
    ctx?.clearRect(0, 0, width, height)
  }

  function drawText() {
    clearCanvas()
    ctx?.fillText(text, Math.floor(width / 2), Math.floor(height / 2))
  }

  ctx.font = font
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Custom fonts need to be loaded first
  await document.fonts.load(ctx.font)

  drawText()

  const imageData = ctx.getImageData(0, 0, width, height)
  let particles: Position[] = generateParticles(imageData, width, height)
  let newParticles = particles

  // After getting the data, need to use the color specified by the configuration
  ctx.fillStyle = color
  drawText()

  const interval = 5000 // ms
  const stay = 3000
  const radius = 1

  let changeDir: ChangeDirection = ChangeDirection.Positive
  let start = 0

  ctx.strokeStyle = color

  function drawParticles(time = 0) {
    if (!ctx) {
      return
    }

    let costTime = time - start
    const stayTime = costTime - interval
    if (
      changeDir === ChangeDirection.Positive &&
      stayTime > 0 &&
      stayTime < stay
    ) {
      requestAnimationFrame(t => {
        drawParticles(t)
      })

      return
    }

    if (costTime > interval || start <= 0) {
      updateParticles()
      start = time
      costTime = 0
    }

    const timeRatio = costTime / interval

    clearCanvas()
    ctx.beginPath()

    for (let i = 0; i < particles.length; i++) {
      const dx = newParticles[i].x - particles[i].x
      const dy = newParticles[i].y - particles[i].y

      let x = particles[i].x + dx * timeRatio
      let y = particles[i].y + dy * timeRatio
      const limit = radius * 2
      x = Math.max(x, limit)
      y = Math.max(y, limit)
      x = Math.min(x, width - limit)
      y = Math.min(y, height - limit)

      ctx.moveTo(x, y)
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
    }

    ctx.stroke()

    requestAnimationFrame(t => {
      drawParticles(t)
    })
  }

  function updateParticles() {
    if (changeDir === ChangeDirection.Positive) {
      particles = newParticles
      newParticles = particles.map(p => {
        return {
          x: randomChange(p.x),
          y: randomChange(p.y)
        }
      })
    } else {
      const temp = particles
      particles = newParticles
      newParticles = temp
    }

    changeDir = changeDir === ChangeDirection.Positive ?
      ChangeDirection.Negative :
      ChangeDirection.Positive
  }

  setTimeout(() => {
    drawParticles(stay)
  }, stay)
}

function generateParticles(imageData: ImageData, width: number, height: number) {
  const data = imageData.data
  const particles: Position[] = []

  let r = 0, g = 0, b = 0, a = 0
  let index = 0
  let pre = 0

  for (let i = 0; i < height; i++) {
    pre = i * width * 4
    for (let j = 0; j < width; j++) {
      index = pre + j * 4

      r = data[index]
      g = data[index + 1]
      b = data[index + 2]
      a = data[index + 3]

      if (
        r === 255 &&
        g === 255 &&
        b === 255 &&
        a === 255
      ) {
        particles.push({
          x: j,
          y: i
        })
      }
    }
  }

  return particles
}