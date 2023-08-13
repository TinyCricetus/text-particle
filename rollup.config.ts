import typescript from 'rollup-plugin-typescript2'
import { RollupOptions } from 'rollup'

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
      tsconfig: './tsconfig.json',
      exclude: ['rollup.config.ts', 'node_modules']
    })
  ]
}

export default config