import typescript from 'rollup-plugin-typescript2'
import { RollupOptions } from 'rollup'
import { shaderSource } from './rollup-plugin-shader-source'

const config: RollupOptions = {
  input: './index.ts',

  output: [
    {
      format: 'cjs',
      file: 'dist/main.js',
      sourcemap: true
    },
    {
      format: 'es',
      file: 'dist/index.js',
      sourcemap: true
    }
  ],

  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    }),
    shaderSource(),
  ]
}

export default config