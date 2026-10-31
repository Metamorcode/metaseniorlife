# ADR-002 · Stack técnica

- **Estado:** Proposto
- **Data:** 2026-10-31
- **Depende de:** ADR-001

## Contexto

Precisamos de uma stack que a equipa já domina (o MetaSenior usa Next.js, Prisma e Postgres),
com tipagem forte de ponta a ponta, que funcione offline nos tablets e que corra bem em
alojamento gerido na UE.

## Decisão

| Camada | Escolha | Alternativas consideradas | Porquê |
| --- | --- | --- | --- |
| Linguagem | TypeScript `strict` (com `noUncheckedIndexedAccess`) | JavaScript, Go | Mesma linguagem no tablet, servidor e domínio; erros apanhados na compilação |
| Framework web | Next.js (App Router) + React | Remix, SvelteKit, Pages Router | Conhecido pela equipa; App Router dá Server Components e server actions; projeto novo, sem custo de migração |
| Validação | Zod em todas as fronteiras (formulários, API, variáveis de ambiente, integrações) | Yup, io-ts | Tipos derivados do esquema |
| Base de dados | PostgreSQL 17 | MySQL, MongoDB | Relacional, transações, Row-Level Security, JSONB quando útil |
| ORM | Prisma | Drizzle, Kysely | Conhecido pela equipa; migrações versionadas. Acesso cru só para RLS e consultas de séries temporais |
| Alojamento BD | Supabase (região UE) | Neon, RDS | Postgres gerido com Auth, Realtime e Storage num só sítio |
| Autenticação | Supabase Auth, cookies httpOnly, MFA para direção | NextAuth, auth própria | Evita repetir a auth própria do MetaSenior; refresh funcional de raiz |
| Tempo real | Supabase Realtime (planta viva) | WebSocket próprio, Pusher | Já incluído; sem servidor extra |
| Estado no cliente | TanStack Query | Redux, SWR | Cache, revalidação, mutações otimistas |
| Offline (tablets) | PWA + IndexedDB (fila de registos com id gerado no cliente) | App nativa | Um só código; idempotência impede duplicados |
| UI | Tailwind CSS + componentes próprios em `packages/ui` | Radix Themes, MUI | Controlo total sobre o ecrã da porta e o desempenho |
| Planta 2D / 3D | SVG / react-three-fiber | Canvas, Babylon | SVG é acessível e leve; o 3D reutiliza os mesmos dados |
| Testes | Vitest (unidade e integração), Playwright (E2E), Testcontainers (Postgres) | Jest, Cypress | Rápido, nativo em ESM/TS |
| Qualidade | ESLint, Prettier, dependency-cruiser, commitlint, Dependabot, gitleaks | — | Barreiras automáticas no CI |
| Observabilidade | Sentry (erros e desempenho), logs estruturados (pino) | Datadog | Plano gratuito suficiente; scrubbing de dados de saúde |
| ML (Fase 4) | Python 3.12 (scikit-learn / LightGBM), FastAPI | Tudo em TS | Ecossistema de ML; isolado como serviço |
| LLM (Fase 3) | A decidir em spike (MSL-071) | — | Depende de DPA, região de processamento e custo |

### Versões fixadas (revistas a cada trimestre)

Node 22 LTS · pnpm 10 · TypeScript 5.9 · Next.js 15 · React 19 · Prisma 6 · PostgreSQL 17 ·
Vitest 3 · Playwright 1.5x.

## O que não usamos (e porquê)

- **Microserviços, Kubernetes, filas próprias:** ver ADR-001.
- **Dois ORMs:** uma só forma de aceder aos dados.
- **`any` e `@ts-ignore` sem justificação:** anulam o TypeScript.
- **Lógica de negócio no cliente:** o MetaSenior calcula valores no browser; aqui tudo o que
  conta (horas, prazos, estados) é calculado no domínio e testado.

## Riscos

- **Prisma + RLS:** o Prisma usa um utilizador de ligação único; o contexto do lar tem de ser
  passado por `set_config` dentro de uma transação. Coberto por testes de isolamento (MSL-020).
- **Supabase Realtime com RLS:** confirmar no spike da planta viva que os eventos respeitam o lar.
- **Next.js App Router muda depressa:** fixar versões e atualizar de forma planeada.
