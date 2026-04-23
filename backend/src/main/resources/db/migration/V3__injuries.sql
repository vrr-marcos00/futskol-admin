CREATE TABLE injuries (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id  UUID        NOT NULL REFERENCES players(id),
    start_date DATE        NOT NULL,
    end_date   DATE,
    notes      TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_injuries_player_end ON injuries(player_id, end_date);
CREATE UNIQUE INDEX ux_injuries_active_per_player ON injuries(player_id) WHERE end_date IS NULL;

ALTER TABLE payments ADD COLUMN injury_id UUID REFERENCES injuries(id) ON DELETE SET NULL;
CREATE INDEX idx_payments_injury ON payments(injury_id);
