import fs from 'fs'

export function shaderSource() {
  return {
    name: 'shader-source',

    load(id: string) {
      let sourceName = ''
      if (id.endsWith('.vert')) {
        sourceName = 'VERTEX_SHADER_SOURCE'
      } else if (id.endsWith('.frag')) {
        sourceName = 'FRAGMENT_SHADER_SOURCE'
      } else {
        return null
      }

      const source = fs.readFileSync(id)
      return `export const ${sourceName} = \`${source}\``
    }
  }
}