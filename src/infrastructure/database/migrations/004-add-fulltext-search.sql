-- Add tsvector column for full-text search
ALTER TABLE posts ADD COLUMN search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX idx_posts_search_vector ON posts USING GIN (search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('spanish', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER posts_search_vector_trigger
  BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION posts_search_vector_update();

-- Update existing rows
UPDATE posts SET search_vector =
  setweight(to_tsvector('spanish', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(content, '')), 'B');
