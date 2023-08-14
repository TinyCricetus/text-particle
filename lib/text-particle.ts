import { Position } from "./interface"

export interface TextParticleConfig {
  text: string

  particleRadius?: number
}

export class TextParticle {
  get context() {
    return this.ctx
  }
  
  set context(newCtx: CanvasRenderingContext2D) {
    this.ctx = newCtx
  }
  
  private canvas = document.createElement('canvas')
  private ctx = this.canvas.getContext('2d')!
  
  constructor(config: TextParticleConfig) {

  }

  render(root: HTMLElement) {
    const { clientHeight, clientWidth } = root
    
    this.canvas.width = clientWidth
    this.canvas.height = clientHeight

    root.appendChild(this.canvas)
  }

  drawParticles() {

  }

  parseImageData() {
    
  }
}