-- Custom SQL migration file, put your code below! --
-- pg_search (ParadeDB) extension. Neon has deprecated this extension, so
-- we wrap in a DO block to avoid build failures on Neon/PostgreSQL versions
-- that no longer allow it. If already installed, this is a no-op.
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_search;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_search extension not available (%, %): %', SQLSTATE, SQLERRM;
END $$;
