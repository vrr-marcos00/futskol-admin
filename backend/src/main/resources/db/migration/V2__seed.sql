-- Tipos de jogadores padrão
INSERT INTO player_types (name, monthly_fee, monthly_limit, active) VALUES
    ('Mensalista',  100.00, NULL, TRUE),
    ('Plantonista',  60.00, 2,    TRUE),
    ('Convidado',    20.00, 1,    TRUE);

-- Usuário admin é criado programaticamente no AdminUserInitializer
-- (evita hardcoding de hash BCrypt na migration).
