import { ParticleConfig } from "../effect"
import { Particle } from "../particle"

export abstract class Renderer {
  constructor(
    protected root: HTMLCanvasElement,
    protected config: ParticleConfig
  ) { }

  abstract resize(): void
  abstract render(particles: Particle[]): void
}