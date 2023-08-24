import { FilterRGBA, Particle } from "./particle"
import { distance, ease, invariant } from "./utils"
import { createProgram, createShader, setAttributeBuffer } from "./webgl"

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

  enableWebGL?: boolean

  pixelFilter?: FilterRGBA
}

export type ParticleEffectRoot = HTMLElement | HTMLCanvasElement

export abstract class ParticleEffect {
  get canBatchDraw() {
    return Boolean(this.color)
  }

  protected canvas: HTMLCanvasElement = document.createElement('canvas')
  protected isRendering = false
  protected unBindMouseEventCallback: (() => void) | null = null

  protected ctx?: CanvasRenderingContext2D

  protected gl?: WebGLRenderingContext
  protected program?: WebGLProgram
  protected pointsBuffer?: WebGLBuffer
  protected colorBuffer?: WebGLBuffer

  protected source = ''
  protected color = ''
  protected particleRadius = 1
  protected particleGap = 2
  protected moveProportionPerFrame = 30
  protected isContinuousEasing = false
  protected showMouseCircle = false
  protected enableWebGL = false

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
    if (root instanceof HTMLCanvasElement) {
      this.canvas = root
    } else {
      root.appendChild(this.canvas)
    }

    const { clientHeight, clientWidth } = root
    this.canvas.width = clientWidth
    this.canvas.height = clientHeight

    this.applyConfig(config)

    if (this.enableWebGL) {
      const canvasGl = this.canvas.getContext('webgl')
      invariant(canvasGl)

      this.gl = canvasGl
      this.initWebGL()
    } else {
      const canvasCtx = this.canvas.getContext('2d')
      invariant(canvasCtx, 'not found canvas 2d context')
      this.ctx = canvasCtx
    }
  }

  destroy() {
    this.disableMouseListener()
  }

  applyConfig(config: Partial<ParticleConfig>) {
    this.enableWebGL = config.enableWebGL ?? this.enableWebGL
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
    console.log('particle count: ', newParticles.length)

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
      const { x, y, r, c } = newParticles[i]
      this.particles[i].updateNext(x, y, r, c)
    }

    // Be sure to record the time here, because the await expression takes time
    this.lastAnimationBeginTime = Date.now()
  }

  async render(source?: string) {
    // Load particles first
    await this.updateParticles(source)

    const _render = () => {
      const costTime = Date.now() - this.lastAnimationBeginTime

      this.particles.forEach(p => {
        if (this.isContinuousEasing) {
          this.updateParticleContinuous(p)
        } else {
          this.updateParticleEase(costTime, p)
        }
      })

      if (this.enableWebGL) {
        this.drawWithWebGL()
      } else {
        this.drawWith2D()
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

  private drawWith2D() {
    const { ctx, particles } = this
    if (!ctx) {
      return
    }

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.canBatchDraw) {
      this.batchDraw(ctx, particles)
    } else {
      particles.forEach(p => {
        this.singleDraw(ctx, p)
      })
    }
  }

  private initWebGL() {
    const gl = this.gl
    if (!gl) {
      return
    }

    const vsSource = /*glsl*/ `
      attribute vec2 a_position;
      attribute vec4 a_color;

      varying vec4 v_color;

      uniform vec2 u_resolution;
      uniform float u_point_size;

      void main() {
        vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
      
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = u_point_size;
        v_color = a_color / vec4(255.0, 255.0, 255.0, 255.0);
      }
    `

    const fsSource = /*glsl*/ `
      precision mediump float;

      varying vec4 v_color;
      
      void main() {
        gl_FragColor = v_color;
      }
    `
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    invariant(vs)
    invariant(fs)

    this.program = createProgram(gl, vs, fs) || undefined
    invariant(this.program)

    gl.useProgram(this.program)

    this.pointsBuffer = gl.createBuffer() || undefined
    this.colorBuffer = gl.createBuffer() || undefined

    if (this.program) {
      const resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution')
      gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height)
      const pointSizeLocation = gl.getUniformLocation(this.program, 'u_point_size')
      gl.uniform1f(pointSizeLocation, this.particleRadius)
    }

    gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  private drawWithWebGL() {
    const { program, gl, particles } = this
    if (!gl || !program) {
      return
    }

    const _positions: number[] = []
    const _colors: number[] = []
    particles.forEach(p => {
      _positions.push(p.x, p.y)
      _colors.push(...p.c)
    })

    const positions = new Float32Array(_positions)
    const colors = new Float32Array(_colors)

    if (this.pointsBuffer) {
      setAttributeBuffer(gl, {
        buffer: this.pointsBuffer,
        location: gl.getAttribLocation(program, 'a_position'),
        readSize: 2
      }, positions)
    }

    if (this.colorBuffer) {
      setAttributeBuffer(gl, {
        buffer: this.colorBuffer,
        location: gl.getAttribLocation(program, 'a_color'),
        readSize: 4
      }, colors)
    }

    gl.drawArrays(gl.POINTS, 0, particles.length)
  }

  private async updateParticles(source?: string) {
    this.source = source || this.source
    if (!this.source) {
      throw new Error('particle effect need a source to generate!')
    }

    this.particles = await this.generateParticles(this.source)
    console.log('particle count: ', this.particles.length)

    return this.particles
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

  private updateDrawStyle(ctx: CanvasRenderingContext2D, color: string) {
    if (ctx.fillStyle !== color) {
      ctx.fillStyle = color
    }

    if (ctx.strokeStyle !== color) {
      ctx.strokeStyle = color
    }
  }

  private singleDraw(ctx: CanvasRenderingContext2D, p: Particle, stroke = false) {
    const { x, y, r, color } = p

    this.updateDrawStyle(ctx, color)

    ctx.moveTo(x, y)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)

    if (stroke) {
      ctx.stroke()
    } else {
      ctx.fill()
    }
  }

  /**
   * We can improve drawing performance if the user sets the color
   */
  private batchDraw(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    this.updateDrawStyle(ctx, this.color)

    ctx.beginPath()

    particles.forEach(p => {
      if (this.particleRadius <= 1) {
        // When the particle radius is less than 1, we can replace the circle with a rectangle
        ctx.rect(p.x, p.y, p.r * 2, p.r * 2)
      } else {
        ctx.roundRect(p.x, p.y, p.r * 2, p.r * 2, p.r)
      }
    })

    ctx.fill()
  }
}