import { Particle } from "../core/particle"
import {
  ParticleConfig,
  ParticleEffect,
  ParticleEffectRoot
} from "../core/particle-effect"

export interface TextParticleConfig extends ParticleConfig {
  /**
 * Used to control particle composition
 * 
 * Example: 'bold 60px Arial'
 */
  font?: string

  textAlign?: CanvasTextAlign
}

export class TextParticle extends ParticleEffect {
  private font = 'bold 60px Arial'
  private textAlign: CanvasTextAlign = 'center'

  constructor(root: ParticleEffectRoot, config: TextParticleConfig) {
    super(root, config)
    this.applyConfig(config)
  }

  override applyConfig(config: Partial<TextParticleConfig>): void {
    super.applyConfig(config)
    this.font = config.font || this.font
    this.textAlign = config.textAlign || this.textAlign
  }

  override async generateParticles(source: string) {
    const tempCanvas = document.createElement('canvas')
    const { width, height } = this.canvas

    tempCanvas.width = width
    tempCanvas.height = height
    // Need to grayscale, but not yet

    const ctx = tempCanvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.font = this.font
    ctx.textAlign = this.textAlign
    ctx.textBaseline = 'middle'

    await document.fonts.load(ctx.font)

    let x = 0
    let y = height / 2
    if (this.textAlign === 'center') {
      x = width / 2
    } else if (this.textAlign === 'right') {
      // const { width: measureWidth } = ctx.measureText(this.source)
      x = width
    } else {
      x = 0
    }
    
    ctx.fillText(source, Math.floor(x), Math.floor(y))

    const tempImageData = ctx.getImageData(0, 0, width, height)
    return Particle.from(tempImageData, this.particleGap, this.particleRadius)
  }
}