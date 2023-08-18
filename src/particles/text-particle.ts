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
  textBaseline?: CanvasTextBaseline
}

export class TextParticle extends ParticleEffect {
  private font = 'bold 60px Arial'
  private textAlign: CanvasTextAlign = 'center'
  private textBaseline: CanvasTextBaseline = 'middle'

  constructor(root: ParticleEffectRoot, config: TextParticleConfig) {
    super(root, config)
    this.applyConfig(config)
  }

  override applyConfig(config: Partial<TextParticleConfig>): void {
    super.applyConfig(config)
    this.font = config.font || this.font
    this.textBaseline = config.textBaseline || this.textBaseline
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
    ctx.textBaseline = this.textBaseline

    await document.fonts.load(ctx.font)

    ctx.fillText(source, Math.floor(width / 2), Math.floor(height / 2))

    const tempImageData = ctx.getImageData(0, 0, width, height)
    return Particle.from(tempImageData, this.particleGap, this.particleRadius)
  }
}