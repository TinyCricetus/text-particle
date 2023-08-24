import { invariant } from "./utils"

export function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  invariant(shader)

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)

  return null
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

  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)

  return null
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