CREATE TABLE comments (
	id UUID PRIMARY KEY,
	content TEXT NOT NULL,
	post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_post_id_created_at
	ON comments (post_id, created_at ASC);

CREATE INDEX idx_comments_author_id
	ON comments (author_id);
