# TextParticle

Create particle effects for text.

## Preview

![preview_1](./images/image_1.png)

![preview_2](./images/image_2.png)

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
import { render } from 'text-particle'

// The root element can be HTMLElement or HTMLCanvasElement
const root = document.getElementById('root')
if (root) {
  render({
    root,
    text: 'Text',
    font: 'bold 50px Microsoft YaHei',
    color: '#333333'
  })
}
```

