import './index.css'

// To make this work, you need to 🧵run build in '../package.json' first
import { ImageParticle, TextParticle } from '../dist/index'

main()

function main() {
  runTextParticle()
  runImageParticle()
}

function runTextParticle() {
  const text = ['Klee', 'Ganyu', 'Kamizato Ayaka', 'Keqing', 'Paimon', 'Kirara']
  const color = ['#e75945', '#80b0e1', '#8eb5e6', '#5c50a6', '#f6f6f4', '#8cbcb4']

  const root = document.getElementById('container_1')
  if (!root) {
    return
  }
  root.style.height = '200px'

  const particleEffect = new TextParticle(root, {
    source: text[0],
    // Custom font need to set in css '@font-face' first 
    font: 'bold 100px lai',
    color: color[0],
    textAlign: 'center',
    particleGap: 4,
    particleRadius: 2,
    showMouseCircle: true,
    enableContinuousEasing: true,
    enableWebGL: true
  })

  particleEffect.render()

  let index = 1
  const transform = () => {
    setTimeout(() => {
      particleEffect.transitionTo(
        text[index % text.length],
        6000,
        { color: color[index % color.length] }
      )
      index++

      transform()
    }, 10000)
  }

  transform()
}

function runImageParticle() {
  const images = [
    '/assets/86f28321e6eaa4ab070c1f6cc150d6432795811a.png@1256w_1048h_!web-article-pic.webp',
    '/assets/22e21662b3d7e092cc1761edcb1f9c672670fd7c.png@1256w_1132h_!web-article-pic.webp',
    '/assets/0d49ea33e131f9083c17c577e9b9657c63ae2e8c.png@1256w_1032h_!web-article-pic.webp',
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
    // color: '#ffffff',
    autoFit: true,
    particleGap: 4,
    particleRadius: 2,
    showMouseCircle: true,
    enableContinuousEasing: true,
    enableWebGL: true,
    // it is important to filter color
    pixelFilter: (r, g, b, a) => {
      return (r + g + b) > 0 && a > 10
    }
  })

  particleEffect.render()

  let index = 1
  const transform = () => {
    setTimeout(() => {
      particleEffect.transitionTo(images[index % images.length], 6000)
      index++

      transform()
    }, 10000)
  }

  transform()
}