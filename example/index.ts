import './index.css'

// To make this work, you need to 🧵run build in '../package.json' first
import { ParticleEffect } from '../dist/index'

function run() {
  runExample_1()
}

function runExample_1() {
  const root = document.getElementById('container_1')
  if (root) {
    const particleEffect = new ParticleEffect(root, {
      content: 'Particle',
      font: 'bold 300px lai',
      color: '#A5F1E9'
    })

    particleEffect.render()

    const text = ['断桥残雪', '城府', '玫瑰花的葬礼', '合拍', '灰色头像', '如果当时']
    let index = 0
    const runSwitch = () => {
      setTimeout(() => {
        particleEffect.transitionTo(text[index % text.length], 3000)
        index++

        runSwitch()
      }, 5000);
    }

    runSwitch()
  }
}

run()