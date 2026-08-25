# Through Their Eyes

Live camera experiment that lets you see a scene through other eyes. The webcam feed is filtered in real time with WebGL shaders for **human**, **dog**, **bee**, and **snake** vision. Dog mode includes optional spoken narration and captions.

Built as an accessible, phone-first prototype for exploring how other species might perceive color and contrast.

Live: [through-their-eyes.vercel.app](https://through-their-eyes.vercel.app)

## Vision modes

- **Human** — unfiltered camera
- **Dog** — dichromatic yellow–blue mapping, with narration
- **Bee** — UV-leaning, high-blue treatment
- **Snake** — pit-organ heat-style luminance map

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL and allow camera access. Works best on a phone or a machine with a webcam.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- WebGL fragment shaders per vision mode
