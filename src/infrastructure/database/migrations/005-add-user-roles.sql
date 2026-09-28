-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'reader'
  CHECK (role IN ('admin', 'author', 'reader'));

-- Create index for role-based queries
CREATE INDEX idx_users_role ON users(role);
