import typescript from 'rollup-plugin-typescript2'
import { RollupOptions } from 'rollup'

const config: RollupOptions = {
  input: './src/index.ts',

  output: [
    {
      name: 'bundle',
      format: 'cjs',
      dir: 'dist/cjs'
    },
    {
      name: 'bundle',
      format: 'es',
      dir: 'dist/es'
    }
  ],

  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: 'rollup.config.ts'
    })
  ]
}

export default config