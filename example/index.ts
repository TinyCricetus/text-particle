import './index.css'

// To make this work, you need to 🧵run build in '../package.json' first
import { ImageParticle, TextParticle } from '../dist/index'

function run() {
  runExample_1()
  runExample_2()
}

function runExample_1() {
  const root = document.getElementById('container_1')
  if (root) {
    const particleEffect = new TextParticle(root, {
      source: 'Particle',
      font: 'bold 200px lai',
      color: '#F1F0E8',
      particleGap: 8,
      particleRadius: 2,
      showMouseCircle: true,
      enableContinuousEasing: true,
    })

    particleEffect.render()

    const text = ['Genshin', 'Impact', 'Honkai', 'Paimon', 'Keqing', 'Klee']
    let index = 0
    const runSwitch = () => {
      particleEffect.transitionTo(text[index % text.length], 2000)
      index++

      setTimeout(() => {
        runSwitch()
      }, 4000)
    }

    setTimeout(() => {
      runSwitch()
    }, 4000)
  }
}

function runExample_2() {
  const images = [
    '/assets/22e21662b3d7e092cc1761edcb1f9c672670fd7c.png@1256w_1132h_!web-article-pic.webp',
    '/assets/5dffdbd1644cc2e6df1fffd22807793b64f24410.png@1256w_1464h_!web-article-pic.webp',
    '/assets/0d49ea33e131f9083c17c577e9b9657c63ae2e8c.png@1256w_1032h_!web-article-pic.webp',
    '/assets/86f28321e6eaa4ab070c1f6cc150d6432795811a.png@1256w_1048h_!web-article-pic.webp',
    '/assets/80793ec461c1b53cbd3abfd4561d51d4c9e6d195.png@1256w_1142h_!web-article-pic.webp',
    '/assets/c3bd3f3e8fff5a7654e9abd031511d0cddbf9024.png@!web-article-pic.webp',
    '/assets/d19d1a28e402fbaa9f6714e767ef9a17b74a7695.png@1256w_894h_!web-article-pic.webp'
  ]

  const root = document.getElementById('container_2')
  if (!root) {
    return
  }

  const particleEffect = new ImageParticle(root, {
    source: images[0],
    color: '#F1F0E8',
    particleGap: 4,
    particleRadius: 2,
    showMouseCircle: false,
    enableContinuousEasing: false,
  })

  particleEffect.render()

  let index = 1
  const delay = 8000

  const runSwitch = () => {
    particleEffect.transitionTo(images[index % images.length], 6000)
    index++

    setTimeout(() => {
      runSwitch()
    }, delay)
  }

  setTimeout(() => {
    runSwitch()
  }, delay)
}

run()