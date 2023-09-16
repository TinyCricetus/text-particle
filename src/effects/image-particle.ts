import { shallowClone, shallowEqual } from "../utils"
import { ParticleConfig, ParticleEffect, ParticleEffectRoot } from "../effect"
import { Particle } from "../particle"


export interface ImageParticleConfig extends ParticleConfig {
  autoFit?: boolean
}

export class ImageParticle extends ParticleEffect {
  private autoFit = false
  private imageCache = new Map<string, HTMLImageElement>()

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

    let image: HTMLImageElement
    const oldImage = this.imageCache.get(source)
    if (oldImage) {
      image = oldImage
    } else {
      image = new Image()
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
    }

    // Need to grayscale, but not yet

    const { width: imageWidth, height: imageHeight } = image
    const config = this._config

    let drawWidth = imageWidth
    let drawHeight = imageHeight
    let offsetX = config.offsetX
    let offsetY = config.offsetY

    if (this.autoFit) {
      const scaleW = width / imageHeight
      const scaleH = height / imageHeight
      const scale = Math.min(scaleW, scaleH)

      const scaledWidth = Math.floor(imageWidth * scale)
      const scaledHeight = Math.floor(imageHeight * scale)

      offsetX = Math.floor(Math.abs(width - scaledWidth) / 2)
      offsetY = Math.floor(Math.abs(height - scaledHeight) / 2)

      drawWidth = scaledWidth
      drawHeight = scaledHeight
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

      this.imageCache.set(source, image)
    }

    return newParticles
  }
}