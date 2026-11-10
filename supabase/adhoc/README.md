# Ad-hoc SQL (one-offs)

Put **repeatable** admin SQL here when useful (e.g. grant premium smoke test).  
**Do not** commit secrets.

The agent (or you) can run:

```bash
npm run db:sql -- --file supabase/adhoc/your-script.sql
```

Requires `DATABASE_URL` in `.env.local` (gitignored).
