# TextParticle

Create high performance particle transition effects for text and image.

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

> If you want to render particles with high performance, enable the option **'enableWebGL'**.


You can get more details from the sample:

**text particle effect:**

```typescript
function renderTextParticle() {
  const text = ['Klee', 'Ganyu']
  const color = ['#e75945', '#80b0e1']

  const root = document.getElementById('container_1')
  if (!root) {
    return
  }

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
  // tips: If you enable the option 'enableContinuousEasing'
  // the transition time will not work.
  particleEffect.transitionTo(
    text[1],
    6000,
    { color: color[1] }
  )

  fromEvent(window, 'resize').pipe(debounceTime(100)).subscribe(() => {
    particleEffect.resize()
  })
}
```

**image particle effect:**

```ts
function renderImageParticle() {
  const images = ['/image1.png', '/image2.png']

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
  // tips: If you enable the option 'enableContinuousEasing'
  // the transition time will not work.
  particleEffect.transitionTo(images[1], 6000)

  fromEvent(window, 'resize').pipe(debounceTime(100)).subscribe(() => {
    particleEffect.resize()
  })
}
```

