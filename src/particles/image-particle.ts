import { Particle } from "../core/particle"
import {
  ParticleConfig,
  ParticleEffect,
  ParticleEffectRoot
} from "../core/particle-effect"

export class ImageParticle extends ParticleEffect {
  constructor(root: ParticleEffectRoot, config: ParticleConfig) {
    super(root, config)
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
    const scale = imageWidth / width
    image.width = width
    image.height = Math.floor(imageHeight / scale)

    const ctx = tempCanvas.getContext('2d')!

    ctx.fillStyle = '#ffffff'
    ctx.drawImage(image, 0, 0)

    const tempImageData = ctx.getImageData(0, 0, width, height)
    return Particle.from(tempImageData, this.particleGap, this.particleRadius)
  }
}