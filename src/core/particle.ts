import { isApproximateEqual } from "./utils"

export class Particle {
  static from(imageData: ImageData, gap = 1, radius = 1) {
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

        if (r > 125 && g > 125 && b > 125 && a > 125) {
          const color = `rgba(${r}, ${g}, ${b}, ${a})`
          result.push(Particle.create(j, i, radius, color))
        }
      }
    }

    return result
  }

  static create(x: number, y: number, r = 1, c = '#000000') {
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

  private _nextX: number
  private _nextY: number
  private _preX: number
  private _preY: number

  constructor(
    public x: number,
    public y: number,
    public r: number,
    public color: string
  ) {
    this._nextX = this._preX = this.x
    this._nextY = this._preY = this.y
  }

  clone() {
    return Particle.create(this.x, this.y, this.r)
  }

  updateNext(x: number, y: number, r = this.r, c = this.color) {
    this._preX = this.x
    this._preY = this.y

    this._nextX = x
    this._nextY = y

    this.r = r
    this.color = c
  }

  update(x: number = this._nextX, y: number = this._nextY) {
    x = isApproximateEqual(x, this._nextX) ? this._nextX : x
    y = isApproximateEqual(y, this._nextY) ? this._nextY : y

    this.x = x
    this.y = y
  }
}