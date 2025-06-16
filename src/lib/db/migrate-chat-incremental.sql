-- Migração incremental para adicionar sistema de status de leitura
-- Execute este SQL no seu banco PostgreSQL

-- 1. Adicionar campo delivered_at na tabela chat_message (se não existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_message' AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE chat_message ADD COLUMN delivered_at TIMESTAMP;
        RAISE NOTICE 'Campo delivered_at adicionado à tabela chat_message';
    ELSE
        RAISE NOTICE 'Campo delivered_at já existe na tabela chat_message';
    END IF;
END $$;

-- 2. Criar tabela chat_message_status (se não existir)
CREATE TABLE IF NOT EXISTS chat_message_status (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id TEXT NOT NULL REFERENCES chat_message(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
    read_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_message_user UNIQUE (message_id, user_id)
);

-- 3. Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_chat_message_status_message_id ON chat_message_status(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_status_user_id ON chat_message_status(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_delivered_at ON chat_message(delivered_at);

-- 4. Marcar mensagens existentes como entregues (opcional)
UPDATE chat_message 
SET delivered_at = created_at 
WHERE delivered_at IS NULL;

-- Verificação final
SELECT 
    (SELECT COUNT(*) FROM chat_message WHERE delivered_at IS NOT NULL) as messages_with_delivery,
    (SELECT COUNT(*) FROM chat_message_status) as read_statuses,
    'Migração concluída com sucesso!' as status; 