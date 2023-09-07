import { isApproximateEqual } from "./utils"

export interface FilterRGBA {
  (r: number, g: number, b: number, a: number): boolean
}

function filterRGBA(r: number, g: number, b: number, a: number) {
  return (r + g + b) > 0 && a > 0
}

export class Particle {
  static from(imageData: ImageData, gap = 1, radius = 1, f?: FilterRGBA) {
    gap = Math.max(1, gap)
    radius = Math.max(1, radius)

    const filter = f || filterRGBA

    const { data, width, height } = imageData
    const result: Particle[] = []

    let r = 0, g = 0, b = 0, a = 0
    let index = 0
    let pre = 0

    for (let i = 0; i < height; i += gap) {
      pre = i * width * 4
      for (let j = 0; j < width; j += gap) {
        index = pre + j * 4

        r = data[index]
        g = data[index + 1]
        b = data[index + 2]
        a = data[index + 3]

        if (filter(r, g, b, a)) {
          result.push(Particle.create(j, i, radius, [r, g, b, a]))
        }
      }
    }

    // console.log('particle count:', result.length)
    return result
  }

  static create(x: number, y: number, r = 1, c = [0, 0, 0, 1]) {
    return new Particle(x, y, r, c)
  }

  static copyWithin(source: Particle[], start = 0, end = source.length) {
    return source.copyWithin(start, end).map(s => s.clone())
  }

  get nextX() {
    return this._nextX
  }

  get nextY() {
    return this._nextY
  }

  get preX() {
    return this._preX
  }

  get preY() {
    return this._preY
  }

  get arrived() {
    return this._nextX === this.x && this._nextY === this.y
  }

  get color() {
    const [r, g, b, a] = this.c
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  private _nextX: number
  private _nextY: number
  private _preX: number
  private _preY: number

  constructor(
    public x: number,
    public y: number,
    public r: number,
    public c: number[]
  ) {
    this._nextX = this._preX = this.x
    this._nextY = this._preY = this.y
  }

  clone() {
    return Particle.create(this.x, this.y, this.r, this.c)
  }

  updateNext(x: number, y: number, r = this.r, c = this.c) {
    this._preX = this.x
    this._preY = this.y

    this._nextX = x
    this._nextY = y

    this.r = r
    this.c = c
  }

  update(x: number = this._nextX, y: number = this._nextY) {
    x = isApproximateEqual(x, this._nextX) ? this._nextX : x
    y = isApproximateEqual(y, this._nextY) ? this._nextY : y

    this.x = x
    this.y = y
  }
}