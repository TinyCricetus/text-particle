# TextParticle

Create particle effects for text.

## Installation

Install text-particle using npm:

```sh
npm install text-particle
```

## Usage

```typescript
import { render } from 'text-particle'

// The root element can be HTMLElement or HTMLCanvasElement
const root = document.getElementById('root')
if (root) {
  render({
    root,
    text: 'text particle'
  })
}
```

