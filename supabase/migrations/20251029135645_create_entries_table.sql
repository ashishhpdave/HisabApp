/*
  # Hisab Kitab - Expense Tracker Database Schema

  1. New Tables
    - `entries`
      - `id` (uuid, primary key) - Auto-generated unique identifier
      - `user_id` (uuid, foreign key) - Links to auth.users
      - `name` (text) - Person/entity name
      - `item` (text) - Item or description
      - `amount` (decimal) - Transaction amount in currency
      - `type` (text) - Transaction type: 'udhar', 'kharcha', or 'income'
      - `date` (date) - Transaction date
      - `note` (text, nullable) - Optional notes
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `entries` table
    - Add policies for authenticated users to:
      - Read their own entries
      - Insert their own entries
      - Update their own entries
      - Delete their own entries

  3. Indexes
    - Index on user_id for faster queries
    - Index on date for sorting and filtering
    - Index on type for category filtering
*/

-- Create entries table
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  item text NOT NULL,
  amount decimal(10, 2) NOT NULL DEFAULT 0,
  type text NOT NULL CHECK (type IN ('udhar', 'kharcha', 'income')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  note text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_type ON entries(type);

-- RLS Policies
-- Users can view their own entries
CREATE POLICY "Users can read own entries"
  ON entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own entries
CREATE POLICY "Users can insert own entries"
  ON entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own entries"
  ON entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own entries"
  ON entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();