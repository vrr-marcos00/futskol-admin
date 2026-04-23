CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE player_types (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(100)   NOT NULL UNIQUE,
    monthly_fee   NUMERIC(10, 2) NOT NULL,
    monthly_limit INTEGER,
    active        BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE TABLE players (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(150) NOT NULL,
    cpf            VARCHAR(11)  NOT NULL UNIQUE,
    phone          VARCHAR(20)  NOT NULL,
    player_type_id UUID         NOT NULL REFERENCES player_types(id),
    active         BOOLEAN      NOT NULL DEFAULT TRUE,
    notes          TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_players_type   ON players(player_type_id);
CREATE INDEX idx_players_active ON players(active);

CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id        UUID           NOT NULL REFERENCES players(id),
    reference_month  DATE           NOT NULL,
    amount           NUMERIC(10, 2) NOT NULL,
    status           VARCHAR(20)    NOT NULL,
    payment_date     DATE,
    notes            TEXT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT now(),
    CONSTRAINT uk_payment_player_month UNIQUE (player_id, reference_month)
);

CREATE INDEX idx_payments_month  ON payments(reference_month);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TABLE costs (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(150)   NOT NULL,
    category   VARCHAR(20)    NOT NULL,
    amount     NUMERIC(10, 2) NOT NULL,
    date       DATE           NOT NULL,
    notes      TEXT,
    created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_costs_date     ON costs(date);
CREATE INDEX idx_costs_category ON costs(category);
