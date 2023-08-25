# TextParticle

Create particle transition effects for text and image.

## Preview

![preview_gif_1](https://github.com/TinyCricetus/text-particle/blob/main/preview/preview_1.gif)

![preview_gif_2](https://github.com/TinyCricetus/text-particle/blob/main/preview/preview_2.gif)

![preview_1](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_1.png)

![preview_2](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_2.png)

![preview_3](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_3.png)

![preview_4](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_4.png)

![preview_5](https://github.com/TinyCricetus/text-particle/blob/main/preview/image_5.png)


## Installation

Install text-particle using npm:

```sh
npm install text-particle
```

## Usage

The library contains two particle effects:

- TextParticle
- ImageParticle

> If you want to render particles with high performance, 
> enable the configuration option **enableWebGL**.


You can get more details from the sample:

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TextParticle Demo</title>
</head>

<body>
  <div id="container_1" class="container_1"></div>
  <div id="container_2" class="container_1"></div>
  <div id="container_3" class="container_1"></div>
  <div id="container_4" class="container_1"></div>
  <div class="display-box">
    <div id="display" class="display"></div>
    <div id="display2" class="display"></div>
  </div>
</body>

</html>
```

```typescript
// code
import './index.css'

// To make this work, you need to 🧵run build in '../package.json' first
import { ImageParticle, TextParticle } from '../dist/index'

main()

function main() {
  runTextParticle()
  runImageParticle()
}

function runTextParticle() {
  const text = ['Klee', 'Ganyu']
  const color = ['#e75945', '#80b0e1']

  const root = document.getElementById('container_1')
  if (!root) {
    return
  }
  root.style.height = '200px'

  const particleEffect = new TextParticle(root, {
    source: text[0],
    color: color[0],
    // Custom font need to set in css '@font-face' first 
    font: 'bold 200px lai',
    textAlign: 'center',
    particleGap: 6,
    particleRadius: 3,
    showMouseCircle: true,
    enableContinuousEasing: true,
    enableWebGL: true
  })

  particleEffect.render()

  let index = 1
  const transform = () => {
    setTimeout(() => {
      particleEffect.applyConfig({ color: color[index % color.length] })
      particleEffect.transitionTo(text[index % text.length], 6000)
      index++
      
      transform()
    }, 10000)
  }

  transform()
}

function runImageParticle() {
  const images = [
    '/assets/86f28321e6eaa4ab070c1f6cc150d6432795811a.png@1256w_1048h_!web-article-pic.webp',
    '/assets/22e21662b3d7e092cc1761edcb1f9c672670fd7c.png@1256w_1132h_!web-article-pic.webp'
  ]

  const root = document.getElementById('container_2')
  if (!root) {
    return
  }

  const particleEffect = new ImageParticle(root, {
    source: images[0],
    autoFit: true,
    particleGap: 1,
    particleRadius: 1,
    showMouseCircle: true,
    enableContinuousEasing: true,
    enableWebGL: true
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
```

