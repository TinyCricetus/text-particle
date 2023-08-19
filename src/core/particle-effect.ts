import { FilterRGBA, Particle } from "./particle"
import { distance, ease } from "./utils"

export interface ParticleConfig {
  source: string

  /**
   * The particle draw width
   */
  width?: number
  /**
   * The particle draw height
   */
  height?: number

  offsetX?: number
  offsetY?: number

  /**
   * Control Particle Radius
   * 
   * Tip: Setting a color will improve particle performance
   */
  color?: string

  /**
   * Control Particle Radius
   */
  particleRadius?: number

  /**
   * Control the sparsity of the particle distribution
   */
  particleGap?: number

  /**
  * Move 1/n of remaining distance per frame.
  * 
  * Make 'enableContinuousEasing' true to take this option effect.
  */
  moveProportionPerFrame?: number
  /**
   * Make 'enableContinuousEasing' true to take this option effect
   */
  showMouseCircle?: boolean
  enableContinuousEasing?: boolean

  pixelFilter?: FilterRGBA
}

export type ParticleEffectRoot = HTMLElement | HTMLCanvasElement

export abstract class ParticleEffect {
  get canBatchDraw() {
    return Boolean(this.color)
  }

  protected canvas: HTMLCanvasElement = document.createElement('canvas')
  protected ctx: CanvasRenderingContext2D
  protected isRendering = false
  protected unBindMouseEventCallback: (() => void) | null = null

  protected source = ''
  protected color = ''
  protected particleRadius = 1
  protected particleGap = 2

  protected moveProportionPerFrame = 30
  protected isContinuousEasing = false
  protected showMouseCircle = false

  protected lastAnimationBeginTime = 0
  protected animationTime = 2000

  protected particles: Particle[] = []

  protected mouseParticle: Particle | null = null

  protected pixelFilter?: FilterRGBA
  protected width?: number
  protected height?: number
  protected offsetX = 0
  protected offsetY = 0

  protected constructor(root: ParticleEffectRoot, config: ParticleConfig) {
    if (root instanceof HTMLElement) {
      root.appendChild(this.canvas)
    } else {
      this.canvas = root
    }

    const { clientHeight, clientWidth } = root
    this.canvas.width = clientWidth
    this.canvas.height = clientHeight

    const canvas2dCtx = this.canvas.getContext('2d')
    if (!canvas2dCtx) {
      throw new Error('not found canvas 2d context')
    }

    this.ctx = canvas2dCtx
    this.applyConfig(config)
  }

  destroy() {
    this.disableMouseListener()
  }

  applyConfig(config: Partial<ParticleConfig>) {
    this.source = config.source || this.source
    this.color = config.color || this.color

    this.particleRadius = config.particleRadius || this.particleRadius
    this.particleGap = config.particleGap || this.particleGap
    // limit the gap and radius
    this.particleGap = Math.max(1, this.particleGap)
    this.particleRadius = Math.max(1, this.particleRadius)

    this.isContinuousEasing = config.enableContinuousEasing ?? this.isContinuousEasing
    this.showMouseCircle = config.showMouseCircle ?? this.showMouseCircle
    this.moveProportionPerFrame = config.moveProportionPerFrame ?? this.moveProportionPerFrame

    this.pixelFilter = config.pixelFilter ?? this.pixelFilter
    this.width = config.width ?? this.width
    this.height = config.height ?? this.height
    this.offsetX = config.offsetX ?? this.offsetX
    this.offsetY = config.offsetY ?? this.offsetY

    if (this.showMouseCircle) {
      this.enableMouseListener()
    } else {
      this.disableMouseListener()
    }
  }

  /**
   * 
   * @param newSource 
   * @param time this option will be disabled if 'enableContinuousEasing' is set to true
   * @returns 
   */
  async transitionTo(newSource: string, time = 2000) {
    if (!this.isRendering) {
      this.render(newSource)
      return
    }

    if (this.source === newSource) {
      return
    }

    this.source = newSource
    this.animationTime = time

    const newParticles = await this.generateParticles(newSource)

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

    // Be sure to record the time here, because the await expression takes time
    this.lastAnimationBeginTime = Date.now()
  }

  async render(source?: string) {
    // Load particles first
    await this.updateParticles(source)

    const _render = () => {
      const costTime = Date.now() - this.lastAnimationBeginTime
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      this.particles.forEach(p => {
        if (this.isContinuousEasing) {
          this.updateParticleContinuous(p)
        } else {
          this.updateParticleEase(costTime, p)
        }
      })

      if (this.canBatchDraw) {
        this.batchDraw(this.particles)
      } else {
        this.particles.forEach(p => {
          this.singleDraw(p)
        })
      }

      if (this.mouseParticle) {
        this.singleDraw(this.mouseParticle, true)
      }

      requestAnimationFrame(() => {
        _render()
      })
    }

    if (!this.isRendering) {
      this.isRendering = true
      _render()
    }
  }

  protected async generateParticles(source: string): Promise<Particle[]> {
    throw new Error('generateParticles need to be implemented')
  }

  private async updateParticles(source?: string) {
    this.source = source || this.source
    if (!this.source) {
      throw new Error('particle effect need a source to generate!')
    }

    this.particles = await this.generateParticles(this.source)
  }

  private enableMouseListener() {
    const onMousemove = (event: MouseEvent) => {
      if (!this.mouseParticle) {
        this.mouseParticle = Particle.create(-100, -100, 20, '#ffffff')
      }

      // to update unstoppable particle
      const rect = this.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.mouseParticle.updateNext(x, y)
      this.mouseParticle.update()
    }

    const onMouseLeave = () => {
      this.mouseParticle = null
    }

    this.canvas.addEventListener('mousemove', onMousemove)
    this.canvas.addEventListener('mouseleave', onMouseLeave)
    this.unBindMouseEventCallback = () => {
      this.mouseParticle = null
      if (this.canvas) {
        this.canvas.removeEventListener('mousemove', onMousemove)
        this.canvas.removeEventListener('mouseleave', onMouseLeave)
      }
    }
  }

  private disableMouseListener() {
    this.unBindMouseEventCallback?.()
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

    if (this.showMouseCircle && this.mouseParticle) {
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

  private updateDrawStyle(color: string) {
    if (this.ctx.fillStyle !== color) {
      this.ctx.fillStyle = color
    }

    if (this.ctx.strokeStyle !== color) {
      this.ctx.strokeStyle = color
    }
  }

  private singleDraw(p: Particle, stroke = false) {
    let { x, y, r, color } = p

    this.updateDrawStyle(color)

    this.ctx.moveTo(x, y)
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, Math.PI * 2)

    if (stroke) {
      this.ctx.stroke()
    } else {
      this.ctx.fill()
    }
  }

  /**
   * We can improve drawing performance if the user sets the color
   */
  private batchDraw(particles: Particle[]) {
    this.updateDrawStyle(this.color)

    this.ctx.beginPath()

    particles.forEach(p => {
      if (this.particleRadius <= 1) {
        // When the particle radius is less than 1, we can replace the circle with a rectangle
        this.ctx.rect(p.x, p.y, p.r * 2, p.r * 2)
      } else {
        this.ctx.roundRect(p.x, p.y, p.r * 2, p.r * 2, p.r)
      }
    })

    this.ctx.fill()
  }
}