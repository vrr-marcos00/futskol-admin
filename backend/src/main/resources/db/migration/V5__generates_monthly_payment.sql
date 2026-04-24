ALTER TABLE player_types
    ADD COLUMN generates_monthly_payment BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE player_types
SET generates_monthly_payment = TRUE
WHERE name IN ('Mensalista', 'Plantonista');
