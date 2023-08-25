import { ParticleConfig } from "../../effect"
import { Particle } from "../../particle"
import { invariant } from "../../utils"
import { Renderer } from "../renderer"

export class CanvasRenderer extends Renderer {
  private ctx: CanvasRenderingContext2D

  private particleRadius = 1
  private color = ''

  constructor(
    protected root: HTMLCanvasElement,
    protected config: ParticleConfig
  ) {
    super(root, config)

    const canvasCtx = this.root.getContext('2d')
    invariant(canvasCtx, 'not found canvas 2d context')

    this.ctx = canvasCtx

    this.color = this.config.color ?? this.color
    this.particleRadius = this.config.particleRadius
  }

  resize() {}

  render(particles: Particle[]) {
    this.ctx.clearRect(0, 0, this.root.width, this.root.height)

    if (this.color) {
      this.batchDraw(particles)
    } else {
      this.singleDraw(particles)
    }
  }

  private singleDraw(particles: Particle[]) {
    particles.forEach(p => {
      this._singleDraw(p)
    })
  }

  private _singleDraw(p: Particle, stroke = false) {
    const { ctx } = this
    const { x, y, r, color } = p

    this.updateDrawStyle(color)

    ctx.moveTo(x, y)
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)

    if (stroke) {
      ctx.stroke()
    } else {
      ctx.fill()
    }
  }

  private updateDrawStyle(color: string) {
    const { ctx } = this

    if (ctx.fillStyle !== color) {
      ctx.fillStyle = color
    }

    if (ctx.strokeStyle !== color) {
      ctx.strokeStyle = color
    }
  }

  /**
   * We can improve drawing performance if the user sets the color
   */
  private batchDraw(particles: Particle[]) {
    const { ctx, color } = this
    this.updateDrawStyle(color)

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