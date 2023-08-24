# GLSL Plugin

A rollup plugin.

The purpose of this plugin is to import source files like "fragment.frag" or "vertex.vert" as shader source strings.

## Suggestion

If you use the VSCode editor, you can install the plug-in "WebGL GLSL Editor" to work with the plug-in, making shader code writing more convenient.

## Usage

If you use typescript, you need to add type declaration like this:

```ts
declare module '*.vert' {
  export const VERTEX_SHADER_SOURCE: string
}

declare module '*.frag' {
  export const FRAGMENT_SHADER_SOURCE: string
}
```

## Example

```ts
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

  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)

  return null
}

const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE)
const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE)
```