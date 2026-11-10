# Security policy

- This repository and its GitHub Pages site are public. Never commit player data, passwords, tokens, database passwords, or private exports.
- Only a Supabase project URL and anon/publishable key may appear in frontend code. Never expose a service_role key.
- Enable RLS on every table that contains user data. The supplied schema restricts profile and save rows to the authenticated owner through auth.uid().
- Guest progress is stored in browser localStorage. Clearing browser data can erase it.
- Browser-submitted scores are user-controlled. A player can alter JavaScript or network requests. Current scores are personal records, not cheat-proof competition results. Do not use them for prizes or money.
- Achievement writes are not allowed from browser clients. A future trusted backend must award achievements.
- Enable email confirmation, configure exact redirect URLs, and enable backups before relying on cloud saves.
- Report security issues privately to the repository owner. Do not publish exploit details in public issues.