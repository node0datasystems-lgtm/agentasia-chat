-- Custom SQL migration file, put your code below! --
-- Neon deprecated pg_search (ParadeDB). Replace BM25 indexes with native
-- PostgreSQL GIN full-text search indexes + B-tree indexes on filter columns.
-- Vector search (pgvector) handles semantic search; these provide basic text
-- search and query filtering.
-- All tables include a user_id btree index for filter pushdown.

-- 1. agents
DROP INDEX IF EXISTS agents_bm25_idx;--> statement-breakpoint
CREATE INDEX agents_fts_idx ON agents USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(slug, '') || ' ' || coalesce(system_role, ''))
);--> statement-breakpoint
CREATE INDEX agents_user_id_idx ON agents (user_id);--> statement-breakpoint

-- 2. topics
DROP INDEX IF EXISTS topics_bm25_idx;--> statement-breakpoint
CREATE INDEX topics_fts_idx ON topics USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(description, ''))
);--> statement-breakpoint
CREATE INDEX topics_user_id_idx ON topics (user_id);--> statement-breakpoint

-- 3. files
DROP INDEX IF EXISTS files_bm25_idx;--> statement-breakpoint
CREATE INDEX files_fts_idx ON files USING GIN (to_tsvector('english', coalesce(name, '')));--> statement-breakpoint
CREATE INDEX files_user_id_idx ON files (user_id);--> statement-breakpoint
CREATE INDEX files_file_type_idx ON files (file_type);--> statement-breakpoint

-- 4. knowledge_bases
DROP INDEX IF EXISTS knowledge_bases_bm25_idx;--> statement-breakpoint
CREATE INDEX knowledge_bases_fts_idx ON knowledge_bases USING GIN (
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);--> statement-breakpoint
CREATE INDEX knowledge_bases_user_id_idx ON knowledge_bases (user_id);--> statement-breakpoint

-- 5. user_memories
DROP INDEX IF EXISTS user_memories_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memories_fts_idx ON user_memories USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(details, ''))
);--> statement-breakpoint
CREATE INDEX user_memories_user_id_idx ON user_memories (user_id);--> statement-breakpoint
CREATE INDEX user_memories_layer_idx ON user_memories (memory_layer);--> statement-breakpoint
CREATE INDEX user_memories_category_idx ON user_memories (memory_category);--> statement-breakpoint
CREATE INDEX user_memories_status_idx ON user_memories (status);--> statement-breakpoint

-- 6. chat_groups
DROP INDEX IF EXISTS chat_groups_bm25_idx;--> statement-breakpoint
CREATE INDEX chat_groups_fts_idx ON chat_groups USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, ''))
);--> statement-breakpoint
CREATE INDEX chat_groups_user_id_idx ON chat_groups (user_id);--> statement-breakpoint

-- 7. user_memories_contexts
DROP INDEX IF EXISTS user_memories_contexts_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memories_contexts_fts_idx ON user_memories_contexts USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(current_status, ''))
);--> statement-breakpoint
CREATE INDEX user_memories_contexts_user_id_idx ON user_memories_contexts (user_id);--> statement-breakpoint
CREATE INDEX user_memories_contexts_type_idx ON user_memories_contexts (type);--> statement-breakpoint

-- 8. user_memories_preferences
DROP INDEX IF EXISTS user_memories_preferences_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memories_preferences_fts_idx ON user_memories_preferences USING GIN (
  to_tsvector('english', coalesce(conclusion_directives, '') || ' ' || coalesce(suggestions, ''))
);--> statement-breakpoint
CREATE INDEX user_memories_preferences_user_id_idx ON user_memories_preferences (user_id);--> statement-breakpoint
CREATE INDEX user_memories_preferences_type_idx ON user_memories_preferences (type);--> statement-breakpoint

-- 9. user_memories_activities
DROP INDEX IF EXISTS user_memories_activities_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memories_activities_fts_idx ON user_memories_activities USING GIN (
  to_tsvector('english', coalesce(notes, '') || ' ' || coalesce(narrative, '') || ' ' || coalesce(feedback, ''))
);--> statement-breakpoint
CREATE INDEX user_memories_activities_user_id_idx ON user_memories_activities (user_id);--> statement-breakpoint
CREATE INDEX user_memories_activities_type_idx ON user_memories_activities (type);--> statement-breakpoint
CREATE INDEX user_memories_activities_status_idx ON user_memories_activities (status);--> statement-breakpoint

-- 10. user_memories_identities
DROP INDEX IF EXISTS user_memories_identities_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memories_identities_fts_idx ON user_memories_identities USING GIN (
  to_tsvector('english', coalesce(description, '') || ' ' || coalesce(role, ''))
);--> statement-breakpoint
CREATE INDEX user_memories_identities_user_id_idx ON user_memories_identities (user_id);--> statement-breakpoint
CREATE INDEX user_memories_identities_type_idx ON user_memories_identities (type);--> statement-breakpoint

-- 11. user_memories_experiences
DROP INDEX IF EXISTS user_memories_experiences_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memories_experiences_fts_idx ON user_memories_experiences USING GIN (
  to_tsvector('english', coalesce(situation, '') || ' ' || coalesce(reasoning, '') || ' ' || coalesce(possible_outcome, '') || ' ' || coalesce(action, '') || ' ' || coalesce(key_learning, ''))
);--> statement-breakpoint
CREATE INDEX user_memories_experiences_user_id_idx ON user_memories_experiences (user_id);--> statement-breakpoint
CREATE INDEX user_memories_experiences_type_idx ON user_memories_experiences (type);--> statement-breakpoint

-- 12. user_memory_persona_documents
DROP INDEX IF EXISTS user_memory_persona_documents_bm25_idx;--> statement-breakpoint
CREATE INDEX user_memory_persona_documents_fts_idx ON user_memory_persona_documents USING GIN (
  to_tsvector('english', coalesce(tagline, '') || ' ' || coalesce(persona, ''))
);--> statement-breakpoint
CREATE INDEX user_memory_persona_documents_user_id_idx ON user_memory_persona_documents (user_id);--> statement-breakpoint

-- 13. documents (large table)
DROP INDEX IF EXISTS documents_bm25_idx;--> statement-breakpoint
CREATE INDEX documents_fts_idx ON documents USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, '') || ' ' || coalesce(slug, ''))
);--> statement-breakpoint
CREATE INDEX documents_user_id_idx ON documents (user_id);--> statement-breakpoint
CREATE INDEX documents_file_type_idx ON documents (file_type);--> statement-breakpoint
CREATE INDEX documents_source_type_idx ON documents (source_type);--> statement-breakpoint

-- 14. messages (largest table)
DROP INDEX IF EXISTS messages_bm25_idx;--> statement-breakpoint
CREATE INDEX messages_fts_idx ON messages USING GIN (
  to_tsvector('english', coalesce(content, '') || ' ' || coalesce(summary, ''))
);--> statement-breakpoint
CREATE INDEX messages_user_id_idx ON messages (user_id);--> statement-breakpoint
CREATE INDEX messages_role_idx ON messages (role);--> statement-breakpoint
