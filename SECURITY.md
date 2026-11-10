# Security policy

- This repository and its GitHub Pages site are public. Never commit player data, passwords, tokens or private backup files.
- Arcade has no backend, account system or third-party data service. Player progress stays in the current browser's local storage.
- Exported progress files contain a player's scores and play history. Treat them as private if you do not want to share that information.
- Browser storage can be removed by the user or browser. Export a backup before clearing site data or changing devices.
- Browser-submitted scores are user-controlled. A player can alter JavaScript or local storage. Current scores are personal records, not verified competition results. Do not use them for prizes or money.
- Do not add client-side secrets. Any future server integration must use server-side validation and an explicit security review.
- Report security issues privately to the repository owner. Do not publish exploit details in public issues.
