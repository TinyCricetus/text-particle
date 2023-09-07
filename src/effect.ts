import { FilterRGBA, Particle } from "./particle"
import { distance, ease, shallowClone, useRAF } from "./utils"
import { Renderer } from "./renderer/renderer"
import { WebGLRenderer } from "./renderer/webgl/webgl-renderer"
import { CanvasRenderer } from "./renderer/canvas/canvas-renderer"

export interface ParticleConfig {
  source: string

  offsetX: number
  offsetY: number

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
  * 
  * Default is 30.
  */
  moveProportionPerFrame: number

  /**
   * Make 'enableContinuousEasing' true to take this option effect
   */
  showMouseCircle: boolean

  enableContinuousEasing: boolean

  enableWebGL: boolean

  /**
   * Control Particle Radius
   * 
   * Tip: Setting a color will improve particle performance
   */
  color?: string

  /**
   * Default is false.
   */
  disableCache?: boolean

  pixelFilter?: FilterRGBA
}

export interface ParticleCache {
  config: ParticleConfig
  particles: Particle[]
}

export type ParticleEffectRoot = HTMLElement | HTMLCanvasElement

const defaultConfig: ParticleConfig = {
  enableWebGL: false,
  source: '',
  color: '',
  particleRadius: 1,
  particleGap: 1,
  // limit the gap and radius
  enableContinuousEasing: true,
  showMouseCircle: true,
  moveProportionPerFrame: 30,
  offsetX: 0,
  offsetY: 0,
  disableCache: false
}

function mergeConfig(source: ParticleConfig, config: Partial<ParticleConfig>) {
  const template = shallowClone(source)

  Object.assign(template, {
    enableWebGL: config.enableWebGL ?? source.enableWebGL,
    source: config.source ?? source.source,
    color: config.color ?? source.color,
    // limit the gap and radius
    particleRadius: config.particleRadius ?? source.particleRadius,
    particleGap: config.particleGap ?? source.particleGap,
    enableContinuousEasing: config.enableContinuousEasing ?? source.enableContinuousEasing,
    showMouseCircle: config.showMouseCircle ?? source.showMouseCircle,
    moveProportionPerFrame: config.moveProportionPerFrame ?? source.moveProportionPerFrame,
    offsetX: config.offsetX ?? source.offsetX,
    offsetY: config.offsetY ?? source.offsetY,
    disableCache: config.disableCache ?? source.disableCache,
    pixelFilter: config.pixelFilter ?? source.pixelFilter
  })

  return template
}

export abstract class ParticleEffect {
  protected renderer: Renderer
  protected canvas: HTMLCanvasElement = document.createElement('canvas')
  protected isRendering = false
  protected cacheMap = new Map<string, ParticleCache>()
  protected unBindMouseEventCallback: (() => void) | null = null

  protected lastAnimationBeginTime = 0
  protected animationTime = 2000

  protected particles: Particle[] = []
  protected mouseParticle: Particle | null = null

  protected _config: ParticleConfig

  protected constructor(root: ParticleEffectRoot, config: Partial<ParticleConfig>) {
    if (root instanceof HTMLCanvasElement) {
      this.canvas = root
    } else {
      root.appendChild(this.canvas)
    }

    const { clientHeight, clientWidth } = root
    this.canvas.width = clientWidth
    this.canvas.height = clientHeight

    this._config = mergeConfig(defaultConfig, config)

    if (this._config.enableWebGL) {
      this.renderer = new WebGLRenderer(this.canvas, this._config)
    } else {
      this.renderer = new CanvasRenderer(this.canvas, this._config)
    }

    if (this._config.showMouseCircle) {
      this.enableMouseListener()
    } else {
      this.disableMouseListener()
    }
  }

  destroy() {
    this.disableMouseListener()
    this.cacheMap.clear()
  }

  /**
   * 
   * @param newSource 
   * @param time this option will be disabled if 'enableContinuousEasing' is set to true
   * @returns 
   */
  async transitionTo(newSource: string, time: number, config: Partial<ParticleConfig> = {}) {
    this._config = mergeConfig(this._config, config)

    if (!this.isRendering) {
      this.render(newSource)
      return
    }

    if (this._config.source === newSource) {
      return
    }

    this._config.source = newSource
    this.animationTime = time

    const newParticles = await this.generateParticles(newSource)
    if (!this.particles.length) {
      throw new Error('Particle generate error, please check the config.')
    }

    const oldLen = this.particles.length
    const newLen = newParticles.length
    if (oldLen < newLen) {
      const difference = newLen - oldLen
      const extra: Particle[] = []
      for (let i = 0; i < difference; i++) {
        extra.push(this.particles[i % oldLen].clone())
      }

      this.particles = this.particles.concat(extra)
    } else if (oldLen > newLen) {
      this.particles.splice(0, oldLen - newLen)
    }

    const len = this.particles.length
    newParticles.sort(() => Math.random() > 0.5 ? 1 : -1)
    for (let i = 0; i < len; i++) {
      const newParticle = newParticles[i]

      this.particles[i].updateNext(
        newParticle.x,
        newParticle.y,
        newParticle.r,
        newParticle.c
      )
    }

    // Be sure to record the time here, because the await expression takes time
    this.lastAnimationBeginTime = Date.now()
  }

  async render(source?: string) {
    this.renderer.resize()

    // Load particles first
    if (source && source !== this._config.source) {
      this._config.source = source
      this.particles = await this.generateParticles(this._config.source)
    }

    if (!this._config.source) {
      throw new Error('Render need config source first!')
    }

    if (!this.particles.length) {
      this.particles = await this.generateParticles(this._config.source)
    }

    const [render] = useRAF(() => {
      const costTime = Date.now() - this.lastAnimationBeginTime

      if (this._config.enableContinuousEasing) {
        this.particles.forEach(p => this.updateParticleContinuous(p))
      } else {
        this.particles.forEach(p => this.updateParticleEase(costTime, p))
      }

      this.renderer.render(this.particles, this._config)
    })

    if (!this.isRendering) {
      this.isRendering = true
      render()
    }
  }

  protected async generateParticles(source: string): Promise<Particle[]> {
    throw new Error('generateParticles need to be implemented')
  }

  private enableMouseListener() {
    const onMousemove = (event: MouseEvent) => {
      if (!this.mouseParticle) {
        this.mouseParticle = Particle.create(-100, -100, 20, [255, 255, 255, 255])
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
    let vx = ((p.nextX - p.x) / this._config.moveProportionPerFrame)
    let vy = ((p.nextY - p.y) / this._config.moveProportionPerFrame)

    if (this._config.showMouseCircle && this.mouseParticle) {
      // avoid mouse move
      const { x, y, r } = this.mouseParticle
      const dis = distance(x, y, p.x, p.y)

      if (dis < r + 10) {
        const A = Math.atan2(p.y - y, p.x - x)

        let reverseV = 2 * (r / dis)
        reverseV = Math.min(1000, reverseV)
        reverseV = Math.max(1, reverseV)

        const reverseVx = Math.cos(A) * reverseV
        const reverseVy = Math.sin(A) * reverseV

        vx += reverseVx
        vy += reverseVy
      }
    }

    // apply change in this frame
    p.update(p.x + vx, p.y + vy)
  }
}