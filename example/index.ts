import './index.css'

// to make this effect, need run build script in '../package.json'
import { render } from '../dist/index'

function run() {
  runExample_1()
}

function runExample_1() {
  const root = document.getElementById('container_1')
  if (root) {
    render({
      root,
      text: 'Text',
      font: 'bold 100px Monospace',
      width: root.clientWidth,
      height: root.clientHeight
    })
  }
}

run()