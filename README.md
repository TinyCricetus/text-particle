# TextParticle

Create particle effects for text.

## Preview

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


You can get more details from the sample:

```html
<!-- html -->
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TextParticle Demo</title>
  <style>
    .container {
      width: 1200px;
      height: 600px;
      margin: auto;
    }

    body {
      background-color: black;
    }

    @font-face {
      font-family: "custom";
      src: url(./assets/custom.ttf);
    }
  </style>
</head>

<body>
  <div id="container_1" class="container"></div>
  <div id="container_2" class="container"></div>
</body>

</html>
```

```typescript
// code
import { ImageParticle, TextParticle } from 'text-particle'

function run() {
  runExample_1()
  runExample_2()
}

function runExample_1() {
  const root = document.getElementById('container_1')
  if (root) {
    const particleEffect = new TextParticle(root, {
      source: 'Particle',
      font: 'bold 200px custom',
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

    runSwitch()
  }
}

function runExample_2() {
  // image url
  const images = ['']

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
```

