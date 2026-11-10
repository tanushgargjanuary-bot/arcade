# Enable accounts and cloud saves

This requires an external Supabase project. The repository cannot create that project or access its owner credentials.

1. Create a Supabase project in your own account.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Enable email sign-up and email confirmation in Authentication settings.
4. Set the Site URL to `https://tanushgargjanuary-bot.github.io`.
5. Add allowed redirect URLs for the production site and your local test URL.
6. Copy the project URL and anon/publishable key from project API settings.
7. Put those two public values in `src/config.js`. Do not use the service_role key.
8. Commit the config change, wait for Pages deployment, then test sign-up, confirmation, login and logout.

The database policies are the security boundary. The anon key is public by design. Do not disable RLS to fix an error.

Cloud saves currently cover Snake, 2048 and Minesweeper. Neon Dodge remains standalone and stores its best score in browser storage. Guest-to-cloud migration, data export and account deletion are not yet implemented. Configure database backups before treating cloud saves as the only copy.