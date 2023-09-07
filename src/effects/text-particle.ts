import { shallowClone, shallowEqual } from "src/utils"
import { ParticleConfig, ParticleEffect, ParticleEffectRoot } from "../effect"
import { Particle } from "../particle"


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

  constructor(root: ParticleEffectRoot, config: Partial<TextParticleConfig>) {
    super(root, config)
    this.updateConfig(config)
  }

  updateConfig(config: Partial<TextParticleConfig>) {
    this.font = config.font ?? this.font
    this.textAlign = config.textAlign ?? this.textAlign
  }

  override transitionTo(newSource: string, time = 2000, config: Partial<TextParticleConfig> = {}): Promise<void> {
    this.updateConfig(config)
    return super.transitionTo(newSource, time, config)
  }

  override async generateParticles(source: string) {
    const old = this.cacheMap.get(source)
    if (old && shallowEqual(old.config, this._config)) {
      return old.particles
    }

    const tempCanvas = document.createElement('canvas')
    const { width, height } = this.canvas

    tempCanvas.width = width
    tempCanvas.height = height
    // Need to grayscale, but not yet

    const ctx = tempCanvas.getContext('2d')!
    const config = this._config

    ctx.fillStyle = config.color || '#FAF0E6'
    ctx.font = this.font
    ctx.textAlign = this.textAlign
    ctx.textBaseline = 'middle'

    await document.fonts.load(ctx.font)

    let x = 0
    let y = height / 2
    if (this.textAlign === 'center') {
      x = width / 2
    } else if (this.textAlign === 'right') {
      x = width
    } else {
      x = 0
    }

    ctx.fillText(source, Math.floor(x), Math.floor(y))

    const tempImageData = ctx.getImageData(0, 0, width, height)

    const newParticles = Particle.from(
      tempImageData,
      config.particleGap,
      config.particleRadius,
      config.pixelFilter
    )

    if (!this._config.disableCache) {
      this.cacheMap.set(source, {
        config: shallowClone(config),
        particles: newParticles.map(p => p.clone())
      })
    }

    return newParticles
  }
}