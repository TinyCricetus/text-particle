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
      font: 'bold 200px lai',
      color: '#F1F0E8',
      particleGap: 8,
      particleRadius: 2,
      showMouseCircle: true,
      enableContinuousEasing: true,
    })

    particleEffect.render()

    const text = ['Particle', 'Win', 'Super', 'Good', 'Success', 'Okay']
    let index = 0
    const runSwitch = () => {
      particleEffect.transitionTo(text[index % text.length], 2000)
      index++

      setTimeout(() => {
        runSwitch()
      }, 3000);
    }

    runSwitch()
  }
}

run()