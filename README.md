# Arcade

A small collection of browser games. The first game is **Neon Dodge**.

Play it here: **https://tanushgargjanuary-bot.github.io/arcade/**

## Neon Dodge

Move the cyan ship. Avoid red hazards. Collect yellow energy orbs. Your score increases while you survive. Energy orbs add bonus points. The game gets harder over time.

### Controls

- **Move:** WASD or arrow keys
- **Mobile:** Touch and drag on the game area
- **Pause / resume:** P or Escape, or use the pause control
- **Start / restart:** Enter or the on-screen button

Your best score is saved in your browser with local storage. It is local to that browser and device.

## Run locally

No build step or package installation is required.

1. Clone this repository.
2. Open `index.html` in a modern browser.

For a local HTTP server, run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deployment

This repository uses GitHub Actions to deploy the root directory to GitHub Pages when changes reach `main`. The workflow is in `.github/workflows/pages.yml`.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Project structure

```text
.
├── .github/
│   └── workflows/
│       └── pages.yml
├── assets/
│   └── favicon.svg
├── index.html
├── game.js
├── styles.css
└── README.md
```

## Contributing

Keep the game dependency-free unless a new dependency has a clear benefit. Keep game logic in small, readable modules. Test keyboard and touch controls after gameplay changes. Do not commit generated build output or personal data.

## License

MIT. See [LICENSE](LICENSE).