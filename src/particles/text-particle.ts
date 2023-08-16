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
 * Example: 'bold 50px Microsoft YaHei'
 */
  font: string
}

export class TextParticle extends ParticleEffect {
  private font = 'bold 200px Arial'

  constructor(root: ParticleEffectRoot, config: Partial<TextParticleConfig>) {
    super(root)

    this.applyConfig(config)
    this.initPromise = this.generateParticles(this.source)
    this.initPromise.then(particles => {
      this.initPromise = null
      this.particles = particles
    })
  }

  override applyConfig(config: Partial<TextParticleConfig>) {
    super.applyConfig(config)
    this.font = config.font || this.font
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
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    await document.fonts.load(ctx.font)

    ctx.fillText(source, Math.floor(width / 2), Math.floor(height / 2))

    const tempImageData = ctx.getImageData(0, 0, width, height)
    return Particle.from(tempImageData, this.particleGap, this.particleRadius)
  }
}