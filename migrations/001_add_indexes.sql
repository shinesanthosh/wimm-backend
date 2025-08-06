-- Add indexes for better query performance
-- Index for cashflow queries by user and time
CREATE INDEX IF NOT EXISTS idx_cashflow_user_time ON cashflow_data(user_id, time DESC);

-- Index for user lookup by username
CREATE INDEX IF NOT EXISTS idx_user_username ON user_data(user_name);

-- Index for cashflow user foreign key (if not already exists)
CREATE INDEX IF NOT EXISTS idx_cashflow_user_id ON cashflow_data(user_id);