import { Particle } from "../core/particle"
import {
  ParticleConfig,
  ParticleEffect,
  ParticleEffectRoot
} from "../core/effect"

export interface ImageParticleConfig extends ParticleConfig {
  autoFit?: boolean
}

export class ImageParticle extends ParticleEffect {
  private autoFit = false

  constructor(root: ParticleEffectRoot, config: ImageParticleConfig) {
    super(root, config)
    this.applyConfig(config)
  }

  override applyConfig(config: Partial<ImageParticleConfig>) {
    super.applyConfig(config)
    this.autoFit = config.autoFit ?? this.autoFit
  }

  override async generateParticles(source: string) {
    const tempCanvas = document.createElement('canvas')
    const { width, height } = this.canvas

    tempCanvas.width = width
    tempCanvas.height = height

    const image = new Image()
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

    let drawWidth = this.width || imageWidth
    let drawHeight = this.height || imageHeight
    let offsetX = this.offsetX
    let offsetY = this.offsetY

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
    return Particle.from(tempImageData, this.particleGap, this.particleRadius, this.pixelFilter)
  }
}