-- Create table for problem categories
CREATE TABLE IF NOT EXISTS product_problem_category (
    id uuid PRIMARY KEY,
    name text NOT NULL UNIQUE,
    color text,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
);

-- Add column to product_problem
ALTER TABLE product_problem
ADD COLUMN IF NOT EXISTS problem_category_id uuid REFERENCES product_problem_category(id);

-- Add column to product_activity
ALTER TABLE product_activity
ADD COLUMN IF NOT EXISTS problem_category_id uuid REFERENCES product_problem_category(id); 