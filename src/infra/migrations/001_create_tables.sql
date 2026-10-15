-- Criar a tabela de cargas químicas com relacionamento para produtos químicos
CREATE TABLE IF NOT EXISTS cargas_quimicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_carga VARCHAR(100) NOT NULL,
    produto_quimico_id UUID NOT NULL,
    quantidade NUMERIC(12, 2) NOT NULL CHECK (quantidade > 0),
    unidade_medida VARCHAR(20) NOT NULL,
    origem VARCHAR(255),
    destino VARCHAR(255),
    responsavel_tecnico VARCHAR(255) NOT NULL CHECK (length(trim(responsavel_tecnico)) > 0),
    documentacao_obrigatoria BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'registrada',
    motivo_bloqueio TEXT,
    data_entrada TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Chave estrangeira ligando a carga ao produto químico
    CONSTRAINT fk_carga_produto_quimico 
        FOREIGN KEY (produto_quimico_id) 
        REFERENCES produtos_quimicos(id) 
        ON DELETE RESTRICT
);

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_cargas_quimicas_produto_id ON cargas_quimicas(produto_quimico_id);
CREATE INDEX IF NOT EXISTS idx_cargas_quimicas_status ON cargas_quimicas(status);
CREATE INDEX IF NOT EXISTS idx_cargas_quimicas_codigo ON cargas_quimicas(codigo_carga);