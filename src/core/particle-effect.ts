import { Particle } from "./particle"
import { distance, ease } from "./utils"

export interface ParticleConfig {
  source: string

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

export type ParticleEffectRoot = HTMLElement | HTMLCanvasElement

export class ParticleEffect {
  protected canvas: HTMLCanvasElement = document.createElement('canvas')
  protected ctx: CanvasRenderingContext2D
  protected unBindMouseEventCallbacks: (() => void)[] = []

  protected source = ''
  protected color = '#000000'
  protected particleRadius = 2
  protected particleGap = 8

  protected moveProportionPerFrame = 30
  protected isContinuousEasing = false
  protected showMouseCircle = false

  protected lastAnimationBeginTime = 0
  protected animationTime = 2000

  protected particles: Particle[] = []

  protected mouseParticle = Particle.create(0, 0, 20)

  constructor(root: ParticleEffectRoot, config: Partial<ParticleConfig>) {
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

    this.generateParticles(this.source).then(particles => {
      this.particles = particles
    })
  }

  destroy() {
    this.disableMouseListener()
  }

  applyConfig(config: Partial<ParticleConfig>) {
    this.source = config.source || this.source
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
   * @param newSource 
   * @param time this option will be disabled if 'isContinuousEasing' is set to true
   * @returns 
   */
  async transitionTo(newSource: string, time = 2000) {
    if (this.source === newSource) {
      return
    }

    this.source = newSource
    this.animationTime = time
    this.lastAnimationBeginTime = Date.now()

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

  protected enableMouseListener() {
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

  protected disableMouseListener() {
    this.unBindMouseEventCallbacks.forEach(cb => cb())
    this.unBindMouseEventCallbacks = []
  }

  protected updateParticleEase(costTime: number, p: Particle) {
    const x = ease(costTime, this.animationTime, p.preX, p.nextX)
    const y = ease(costTime, this.animationTime, p.preY, p.nextY)

    p.update(x, y)
  }

  protected updateParticleContinuous(p: Particle) {
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

  protected drawMouseParticle() {
    this.ctx.save()

    this.ctx.strokeStyle = '#ffffff'
    this.mouseParticle.update()
    this.drawParticle(this.mouseParticle, true)

    this.ctx.restore()
  }

  protected drawParticle(p: Particle, stroke = false) {
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

  protected async generateParticles(source: string): Promise<Particle[]> {
    throw new Error('generateParticles need to be implemented')
  }
}