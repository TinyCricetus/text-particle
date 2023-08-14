// export interface ParticleConfig {
//   root: HTMLElement | HTMLCanvasElement
//   text: string
//   /** Example: 'bold 50px Microsoft YaHei' */
//   font: string

//   color?: string
//   stay?: number
//   changeRange?: number
//   width?: number
//   height?: number
// }

// enum ChangeDirection {
//   Positive,
//   Negative
// }

// export async function render(config: ParticleConfig) {
//   const {
//     root,
//     text,
//     font,
//     color = '#dddddd'
//   } = config

//   let width = 200
//   let height = 100

//   let canvas: HTMLCanvasElement
//   if (root instanceof HTMLCanvasElement) {
//     canvas = root
//     width = canvas.width
//     height = canvas.height
//   } else {
//     canvas = document.createElement('canvas')
//     root.appendChild(canvas)
//   }

//   width = config.width || width
//   height = config.height || height

//   canvas.width = width
//   canvas.height = height

//   const ctx = canvas.getContext('2d')
//   if (!ctx) {
//     console.warn('Platform does not support canvas 2d.')
//     return
//   }

//   function clearCanvas() {
//     ctx?.clearRect(0, 0, width, height)
//   }

//   function drawText() {
//     clearCanvas()
//     ctx?.fillText(text, Math.floor(width / 2), Math.floor(height / 2))
//   }

//   ctx.font = font
//   ctx.fillStyle = '#ffffff'
//   ctx.textAlign = 'center'
//   ctx.textBaseline = 'middle'

//   // Custom fonts need to be loaded first
//   await document.fonts.load(ctx.font)

//   drawText()

//   const interval = 1000 // ms
//   const stay = 0
//   const radius = 1
//   const imageData = ctx.getImageData(0, 0, width, height)

//   let particles = getPositionFromImageData(imageData, 4)
//   let newParticles = particles

//   // After getting the data, need to use the color specified by the configuration
//   ctx.fillStyle = color
//   drawText()

//   let changeDir: ChangeDirection = ChangeDirection.Positive
//   let start = 0

//   function drawParticles(time = 0) {
//     if (!ctx) {
//       return
//     }

//     let costTime = time - start
//     const stayTime = costTime - interval
//     if (
//       changeDir === ChangeDirection.Positive &&
//       stayTime > 0 &&
//       stayTime < stay
//     ) {
//       requestAnimationFrame(t => {
//         drawParticles(t)
//       })

//       return
//     }

//     if (costTime > interval || start <= 0) {
//       updateParticles()
//       start = time
//       costTime = 0
//     }

//     const timeRatio = costTime / interval

//     clearCanvas()

//     for (let i = 0; i < particles.length; i++) {
//       if (i % 2 === 0) {
//         continue
//       }

//       const dx = newParticles[i].x - particles[i].x
//       const dy = newParticles[i].y - particles[i].y

//       let x = particles[i].x + dx * timeRatio
//       let y = particles[i].y + dy * timeRatio
//       const limit = radius * 2
//       x = Math.max(x, limit)
//       y = Math.max(y, limit)
//       x = Math.min(x, width - limit)
//       y = Math.min(y, height - limit)

//       ctx.moveTo(x, y)
//       ctx.beginPath()
//       ctx.arc(x, y, radius, 0, 2 * Math.PI)
//       ctx.fill()
//     }

//     requestAnimationFrame(t => {
//       drawParticles(t)
//     })
//   }

//   function updateParticles() {
//     if (changeDir === ChangeDirection.Positive) {
//       particles = newParticles
//       newParticles = particles.map(p => {
//         return {
//           x: randomChange(p.x, radius),
//           y: randomChange(p.y, radius)
//         }
//       })
//     } else {
//       const temp = particles
//       particles = newParticles
//       newParticles = temp
//     }

//     changeDir = changeDir === ChangeDirection.Positive ?
//       ChangeDirection.Negative :
//       ChangeDirection.Positive
//   }

//   setTimeout(() => {
//     drawParticles(stay)
//   }, stay)
// }

export class Particle {
  static from(imageData: ImageData, gap = 1) {
    const { data, width, height } = imageData
    const result: Particle[] = []

    let r = 0, g = 0, b = 0, a = 0
    let index = 0
    let pre = 0

    for (let i = 0; i < height; i += gap) {
      pre = i * width * 4
      for (let j = 0; j < width; j += gap) {
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
          result.push(Particle.create(j, i))
        }
      }
    }

    return result
  }

  static create(x: number, y: number, r = 2) {
    return new Particle(x, y, r)
  }

  static copyWithin(source: Particle[], start = 0, end = source.length) {
    return source.copyWithin(start, end).map(s => s.clone())
  }

  get oldX() {
    return this._oldX
  }

  get oldY() {
    return this._oldY
  }

  private _oldX
  private _oldY

  constructor(
    public x: number,
    public y: number,
    public r: number
  ) {
    this._oldX = this.x
    this._oldY = this.y
  }

  clone() {
    return Particle.create(this.x, this.y, this.r)
  }

  updatePosition(x: number, y: number) {
    this._oldX = this.x
    this._oldY = this.y

    this.x = x
    this.y = y
  }
}

export interface ParticleConfig {
  content: string
  /** Example: 'bold 50px Microsoft YaHei' */
  font: string
  color: string
}

export class ParticleEffect {
  private canvas: HTMLCanvasElement = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D

  private content = ''
  private font = 'bold 200px Arial'
  private color = '#000000'

  private particles: Particle[] = []

  private lastTime = 0
  private transitionTime = 2000 // ms

  constructor(root: HTMLElement | HTMLCanvasElement, config: Partial<ParticleConfig>) {
    if (root instanceof HTMLElement) {
      const { clientHeight, clientWidth } = root
      this.canvas.width = clientWidth
      this.canvas.height = clientHeight
      root.appendChild(this.canvas)
    } else {
      this.canvas = root
    }

    const canvas2dCtx = this.canvas.getContext('2d')
    if (!canvas2dCtx) {
      throw new Error('not found canvas 2d context')
    }

    this.ctx = canvas2dCtx
    this.content = config.content || this.content
    this.font = config.font || this.font
    this.color = config.color || this.color

    this.generateParticles(this.content).then(particles => {
      this.particles = particles
    })
  }

  async transitionTo(newContent: string, time = 2000) {
    if (this.content === newContent) {
      return
    }
    
    this.transitionTime = time
    this.content = newContent

    const newParticles = await this.generateParticles(newContent)
    const oldLen = this.particles.length
    const newLen = newParticles.length

    if (oldLen < newLen) {
      const difference = newLen - oldLen
      const extra: Particle[] = []
      for (let i = 0; i < difference; i++) {
        extra.push(this.particles[i % oldLen].clone())
      }

      this.particles = this.particles.concat(extra)
    } else if (oldLen - newLen > 0) {
      this.particles.splice(0, oldLen - newLen)
    }

    const len = this.particles.length
    newParticles.sort(() => Math.random() > 0.5 ? 1 : -1)
    for (let i = 0; i < len; i++) {
      const { x, y } = newParticles[i]
      this.particles[i].updatePosition(x, y)
    }

    this.lastTime = Date.now()
  }

  render() {
    const costTime = Date.now() - this.lastTime

    if (this.ctx.fillStyle !== this.color) {
      this.ctx.fillStyle = this.color
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.particles.forEach(p => {
      let x = p.x
      let y = p.y
      if (costTime < this.transitionTime) {
        const dt = (costTime / this.transitionTime)
        const dx = dt * (p.x - p.oldX)
        const dy = dt * (p.y - p.oldY)

        x = p.oldX + dx
        y = p.oldY + dy

        x = Math.floor(x)
        y = Math.floor(y)
      }


      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
      this.ctx.arc(x, y, p.r, 0, Math.PI * 2)
      this.ctx.fill()
    })

    requestAnimationFrame(() => {
      this.render()
    })
  }

  private async generateParticles(content: string) {
    const tempCanvas = document.createElement('canvas')
    const { width, height } = this.canvas

    tempCanvas.width = width
    tempCanvas.height = height
    // Need to grayscale, but not yet

    const ctx = tempCanvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.font = this.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    await document.fonts.load(ctx.font)

    ctx.fillText(content, Math.floor(width / 2), Math.floor(height / 2))

    const tempImageData = ctx.getImageData(0, 0, width, height)
    return Particle.from(tempImageData, 4)
  }
}