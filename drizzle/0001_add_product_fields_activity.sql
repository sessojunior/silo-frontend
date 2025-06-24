-- Adiciona campos priority, turns, description em product
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal',
    ADD COLUMN IF NOT EXISTS turns JSONB NOT NULL DEFAULT '["0","6","12","18"]',
    ADD COLUMN IF NOT EXISTS description TEXT;

-- Cria tabela de atividades de produtos
CREATE TABLE IF NOT EXISTS product_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    turn INTEGER NOT NULL CHECK (turn IN (0,6,12,18)),
    status TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_activity_product_date ON product_activity (product_id, date); 