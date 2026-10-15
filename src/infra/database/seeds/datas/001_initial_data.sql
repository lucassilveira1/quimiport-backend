INSERT INTO produtos_quimicos (
    nome, 
    descricao, 
    numero_onu, 
    classe_risco, 
    grupo_compatibilidade, 
    status
) VALUES 
(
    'Ácido Sulfúrico', 
    'Substância altamente corrosiva utilizada em processos industriais', 
    '1830', 
    '8', 
    'A', 
    'ATIVO'
),
(
    'Nitrato de Amônio', 
    'Agente oxidante para fertilizantes e explosivos civis', 
    '1942', 
    '5.1', 
    'B', 
    'ATIVO'
),
(
    'Cloro Gasoso', 
    'Gás liquefeito sob pressão, tóxico e corrosivo', 
    '1017', 
    '2.3' , 
    'C', 
    'INATIVO'
);