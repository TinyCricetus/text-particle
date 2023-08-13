import typescript from 'rollup-plugin-typescript2'
import { RollupOptions } from 'rollup'

export const config: RollupOptions = {
  input: './main.ts',

  plugins: [
    typescript(/*{ plugin options }*/)
  ]
}