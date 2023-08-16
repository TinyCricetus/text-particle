import { isApproximateEqual, ease, distance } from "./utils"

export class Particle {
  static from(imageData: ImageData, gap = 1, radius = 1) {
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
          result.push(Particle.create(j, i, radius))
        }
      }
    }

    return result
  }

  static create(x: number, y: number, r = 1) {
    return new Particle(x, y, r)
  }

  static copyWithin(source: Particle[], start = 0, end = source.length) {
    return source.copyWithin(start, end).map(s => s.clone())
  }

  get nextX() {
    return this._nextX
  }

  get nextY() {
    return this._nextY
  }

  get preX() {
    return this._preX
  }

  get preY() {
    return this._preY
  }

  get arrived() {
    return this._nextX === this.x && this._nextY === this.y
  }

  private _nextX: number
  private _nextY: number
  private _preX: number
  private _preY: number

  constructor(
    public x: number,
    public y: number,
    public r: number
  ) {
    this._nextX = this._preX = this.x
    this._nextY = this._preY = this.y
  }

  clone() {
    return Particle.create(this.x, this.y, this.r)
  }

  updateNext(x: number, y: number) {
    this._preX = this.x
    this._preY = this.y

    this._nextX = x
    this._nextY = y
  }

  update(x: number = this._nextX, y: number = this._nextY) {
    x = isApproximateEqual(x, this._nextX) ? this._nextX : x
    y = isApproximateEqual(y, this._nextY) ? this._nextY : y

    this.x = x
    this.y = y
  }
}

export interface ParticleConfig {
  content: string

  /**
   * Used to control particle composition
   * 
   * Example: 'bold 50px Microsoft YaHei'
   */
  font: string

  /**
   * Control Particle Radius
   */
  color: string

  /**
   * Control Particle Radius
   */
  particleRadius: number

  /**
   * Control the sparsity of the particle distribution
   */
  particleGap: number

  /**
  * Move 1/n of remaining distance per frame.
  * 
  * Make 'enableContinuousEasing' true to take this option effect.
  */
  moveProportionPerFrame: number
  /**
   * Make 'enableContinuousEasing' true to take this option effect
   */
  showMouseCircle: boolean
  enableContinuousEasing: boolean
}

export class ParticleEffect {
  private canvas: HTMLCanvasElement = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  private unBindMouseEventCallbacks: (() => void)[] = []

  private content = ''
  private font = 'bold 200px Arial'
  private color = '#000000'
  private particleRadius = 2
  private particleGap = 8

  private moveProportionPerFrame = 30
  private isContinuousEasing = false
  private showMouseCircle = false

  private lastAnimationBeginTime = 0
  private animationTime = 2000

  private particles: Particle[] = []

  private mouseParticle = Particle.create(0, 0, 20)

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
    this.applyConfig(config)

    this.generateParticles(this.content).then(particles => {
      this.particles = particles
    })
  }

  destroy() {
    this.disableMouseListener()
  }

  applyConfig(config: Partial<ParticleConfig>) {
    this.content = config.content || this.content
    this.font = config.font || this.font
    this.color = config.color || this.color
    this.particleRadius = config.particleRadius || this.particleRadius
    this.particleGap = config.particleGap || this.particleGap

    this.isContinuousEasing = config.enableContinuousEasing || false
    this.showMouseCircle = config.showMouseCircle || false
    this.moveProportionPerFrame = config.moveProportionPerFrame || this.moveProportionPerFrame

    if (this.showMouseCircle) {
      this.enableMouseListener()
    } else {
      this.disableMouseListener()
    }
  }

  /**
   * 
   * @param newContent 
   * @param time this option will be disabled if 'isContinuousEasing' is set to true
   * @returns 
   */
  async transitionTo(newContent: string, time = 2000) {
    if (this.content === newContent) {
      return
    }

    this.content = newContent
    this.animationTime = time
    this.lastAnimationBeginTime = Date.now()

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
      this.particles[i].updateNext(x, y)
    }
  }

  render() {
    if (this.ctx.fillStyle !== this.color) {
      this.ctx.fillStyle = this.color
    }

    if (this.ctx.strokeStyle !== this.color) {
      this.ctx.strokeStyle = this.color
    }

    const costTime = Date.now() - this.lastAnimationBeginTime
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.particles.forEach(p => {
      if (this.isContinuousEasing) {
        this.updateParticleContinuous(p)
      } else {
        this.updateParticleEase(costTime, p)
      }

      this.drawParticle(p)
    })

    if (this.showMouseCircle) {
      this.drawMouseParticle()
    }

    requestAnimationFrame(() => {
      this.render()
    })
  }

  private enableMouseListener() {
    const processUnstoppable = (event: MouseEvent) => {
      // to update unstoppable particle
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.mouseParticle.updateNext(x, y)
    }

    this.canvas.addEventListener('mousemove', processUnstoppable)
    this.unBindMouseEventCallbacks.push(() => {
      if (this.canvas) {
        this.canvas.removeEventListener('mousemove', processUnstoppable)
      }
    })
  }

  private disableMouseListener() {
    this.unBindMouseEventCallbacks.forEach(cb => cb())
    this.unBindMouseEventCallbacks = []
  }

  private updateParticleEase(costTime: number, p: Particle) {
    const x = ease(costTime, this.animationTime, p.preX, p.nextX)
    const y = ease(costTime, this.animationTime, p.preY, p.nextY)

    p.update(x, y)
  }

  private updateParticleContinuous(p: Particle) {
    // velocity of the remain movement
    let vx = ((p.nextX - p.x) / this.moveProportionPerFrame)
    let vy = ((p.nextY - p.y) / this.moveProportionPerFrame)

    if (this.showMouseCircle) {
      // avoid mouse move
      const { x, y, r } = this.mouseParticle
      const dis = distance(x, y, p.x, p.y)

      if (dis < r + 10) {
        const A = Math.atan2(p.y - y, p.x - x)

        const reverseV = 2 * (r / dis)
        const reverseVx = Math.cos(A) * reverseV
        const reverseVy = Math.sin(A) * reverseV

        vx += reverseVx
        vy += reverseVy
      }
    }

    // apply change in this frame
    p.update(p.x + vx, p.y + vy)
  }

  private drawMouseParticle() {
    this.ctx.save()

    this.ctx.strokeStyle = '#ffffff'
    this.mouseParticle.update()
    this.drawParticle(this.mouseParticle, true)

    this.ctx.restore()
  }

  private drawParticle(p: Particle, stroke = false) {
    let { x, y, r } = p

    this.ctx.moveTo(x, y)
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, Math.PI * 2)

    if (stroke) {
      this.ctx.stroke()
    } else {
      this.ctx.fill()
    }
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
    return Particle.from(tempImageData, this.particleGap, this.particleRadius)
  }
}