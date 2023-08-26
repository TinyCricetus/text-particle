import { ParticleConfig } from "../../effect"
import { Particle } from "../../particle"
import { invariant } from "../../utils"
import { Renderer } from "../renderer"
import { FRAGMENT_SHADER_SOURCE } from './shader-source/fragment.frag'
import { VERTEX_SHADER_SOURCE } from './shader-source/vertex.vert'

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  invariant(shader)

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  const errorInfo = gl.getShaderInfoLog(shader) || ''
  gl.deleteShader(shader)

  throw new Error(errorInfo)
}

export function createProgram(gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) {
  const program = gl.createProgram()
  invariant(program)

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)

  gl.linkProgram(program)

  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  const errorInfo = gl.getProgramInfoLog(program) || ''
  gl.deleteProgram(program)

  throw new Error(errorInfo)
}

interface Buffer {
  buffer: WebGLBuffer,
  location: number
  readSize: number
}

/**
 * 
 * @param gl 
 * @param program 
 * @param points 
 * @returns 
 */
export function setAttributeBuffer(gl: WebGLRenderingContext, buffer: Buffer, points: Float32Array) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer)
  gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW)

  gl.vertexAttribPointer(buffer.location, buffer.readSize, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(buffer.location)
}

export class WebGLRenderer extends Renderer {
  private gl: WebGLRenderingContext
  private program: WebGLProgram
  private pointsBuffer: WebGLBuffer
  private colorBuffer: WebGLBuffer

  constructor(
    protected root: HTMLCanvasElement,
    protected config: ParticleConfig
  ) {
    super(root, config)

    const gl = this.root.getContext('webgl')
    invariant(gl, 'Not found webgl context.')

    this.gl = gl

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)

    this.program = createProgram(gl, vs, fs)
    invariant(this.program)

    gl.useProgram(this.program)

    const pb = gl.createBuffer()
    invariant(pb, 'Point buffer creation failed.')
    const cb = gl.createBuffer()
    invariant(cb, 'Color buffer creation failed.')

    this.pointsBuffer = pb
    this.colorBuffer = cb
  }

  resize() {
    const { program, gl } = this

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    gl.uniform2f(resolutionLocation, this.root.width, this.root.height)

    const pointSizeLocation = gl.getUniformLocation(program, 'u_point_size')
    gl.uniform1f(pointSizeLocation, this.config.particleRadius || 1)

    gl.viewport(0, 0, this.root.width, this.root.height)
  }

  render(particles: Particle[]) {
    const { program, gl } = this

    const len = particles.length
    const _positions = new Array(len * 2)
    const _colors = new Array(len * 4)

    let pIndex = 0, cIndex = 0
    particles.forEach((p) => {
      _positions[pIndex++] = p.x
      _positions[pIndex++] = p.y

      for (let i = 0; i < p.c.length; i++) {
        _colors[cIndex++] = p.c[i]
      }
    })

    const positions = new Float32Array(_positions)
    const colors = new Float32Array(_colors)

    setAttributeBuffer(gl, {
      buffer: this.pointsBuffer,
      location: gl.getAttribLocation(program, 'a_position'),
      readSize: 2
    }, positions)

    setAttributeBuffer(gl, {
      buffer: this.colorBuffer,
      location: gl.getAttribLocation(program, 'a_color'),
      readSize: 4
    }, colors)

    gl.drawArrays(gl.POINTS, 0, particles.length)
  }
}