import { shallowClone, shallowEqual } from "../utils"
import { ParticleConfig, ParticleEffect, ParticleEffectRoot } from "../effect"
import { Particle } from "../particle"


export interface ImageParticleConfig extends ParticleConfig {
  autoFit?: boolean
}

export class ImageParticle extends ParticleEffect {
  private autoFit = false

  constructor(root: ParticleEffectRoot, config: Partial<ImageParticleConfig>) {
    super(root, config)
    this.updateConfig(config)
  }

  updateConfig(config: Partial<ImageParticleConfig>) {
    this.autoFit = config.autoFit ?? this.autoFit
  }

  override transitionTo(newSource: string, time = 2000, config: Partial<ImageParticleConfig> = {}): Promise<void> {
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

    const image = new Image()
    image.crossOrigin = 'anonymous'
    const loadPromise = new Promise((resolve, reject) => {
      image.onload = (ev) => {
        resolve(ev)
      }
      image.onerror = (err) => {
        reject(err)
      }
    })

    image.src = source
    await loadPromise

    // Need to grayscale, but not yet

    const { width: imageWidth, height: imageHeight } = image
    const config = this._config

    let drawWidth = imageWidth
    let drawHeight = imageHeight
    let offsetX = config.offsetX
    let offsetY = config.offsetY

    if (this.autoFit) {
      let scale = 1
      if (height < width) {
        scale = height / imageHeight
      } else {
        scale = width / imageWidth
      }

      const scaleWidth = Math.floor(imageWidth * scale)
      const scaleHeight = Math.floor(imageHeight * scale)

      offsetX = Math.floor(Math.abs(width - scaleWidth) / 2)
      offsetY = Math.floor(Math.abs(height - scaleHeight) / 2)

      drawWidth = scaleWidth
      drawHeight = scaleHeight
    }

    const ctx = tempCanvas.getContext('2d')!
    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight)
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