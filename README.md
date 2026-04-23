# Futskol Admin

Sistema de gestão financeira para uma pelada de futebol amador.

Cores da seleção brasileira: verde `#009C3B` e amarelo `#FFDF00`.

## Estrutura

```
futskol-admin/
├── docker-compose.yml    # Postgres 16
├── backend/              # Spring Boot 3 (Java 21)
└── frontend/             # React + Vite + Tailwind + shadcn/ui
```

## Requisitos

- Docker + Docker Compose
- Java 21 (`sdk install java 21-tem`)
- Maven 3.9+
- Node.js 20+ e npm

## Rodando

### 1) Subir o Postgres

```bash
docker compose up -d
```

Para parar: `docker compose down`. Para resetar o banco: `docker compose down -v`.

### 2) Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend sobe em `http://localhost:8080`. O Flyway aplica as migrations automaticamente.

**Credenciais iniciais:**
- email: `admin@admin.com`
- senha: `admin`

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sobe em `http://localhost:5173`.

## Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Retorna JWT |
| GET | `/auth/me` | Dados do usuário logado |
| GET/POST/PUT | `/player-types` | Tipos de jogador |
| GET/POST/PUT/DELETE | `/players` | Jogadores |
| GET/POST/PUT | `/payments` | Pagamentos |
| GET | `/payments/month/{yearMonth}` | Pagamentos de um mês (ex: `2026-04`) |
| GET/POST/PUT/DELETE | `/costs` | Custos |
| GET | `/dashboard` | Métricas do mês |
| GET | `/dashboard/cash` | Caixa acumulado |

## Regras de negócio

- **CPF único** por jogador, com validação de dígitos verificadores
- **Valor da mensalidade** é fixo por tipo de jogador, mas pode ser sobrescrito no pagamento
- **Status PENDENTE** com mês de referência no passado vira **ATRASADO** automaticamente (job diário 00:05)
- **Delete de jogador** é soft delete (preserva histórico de pagamentos)
- **Caixa atual** = total pago (histórico completo) − total custos (histórico completo)

## Stack

**Backend**
- Java 21 · Spring Boot 3 · Spring Data JPA · Spring Security + JWT (jjwt 0.12)
- PostgreSQL 16 · Flyway · Lombok · Bean Validation

**Frontend**
- React 18 · TypeScript · Vite · React Router v6 · Axios
- TailwindCSS · shadcn/ui · react-hook-form + zod · lucide-react
