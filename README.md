# TextParticle

Create particle effects for text.

## Preview

![preview_1](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_1.png)

![preview_2](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_2.png)

## Installation

Install text-particle using npm:

```sh
npm install text-particle
```

## Usage

```html
<!-- html -->
<canvas
  id="root"
  class="canvas"
  width="200"
  height="100"
></canvas>
```

```typescript
// code
import { ParticleEffect } from '../dist/index'

// The root element can be HTMLElement or HTMLCanvasElement
const root = document.getElementById('root')
if (root) {
  const particleEffect = new ParticleEffect(root, {
    content: 'Particle',
    font: 'bold 80px Arial',
    color: '#A5F1E9'
  })
  particleEffect.render()
  const text = ['Text', 'Particle', '合拍', '如果当时']
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
```

