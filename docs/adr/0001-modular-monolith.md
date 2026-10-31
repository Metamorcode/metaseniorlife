# ADR-001 · Monólito modular num monorepo

- **Estado:** Proposto
- **Data:** 2026-10-31
- **Decisores:** Leo (PO), Claude (desenvolvimento)

## Contexto

- Equipa de duas pessoas, com o Leo em part-time.
- Um cliente piloto (lar do Edu, cerca de 100 residentes) e poucos lares no primeiro ano.
- Dados de saúde (categoria especial do RGPD): cada fronteira de rede a mais é mais um sítio
  onde proteger, registar e auditar.
- O sistema tem de ser estável e rápido nos tablets das portas, e fácil de evoluir.
- O MetaSenior, já em produção, é um monólito Next.js. As suas falhas (lógica espalhada,
  permissões só no front-end, falta de isolamento por empresa) vêm da falta de fronteiras
  internas, não do facto de ser um monólito.
- Mais tarde haverá um componente de ML em Python (previsão de risco, Fase 4).

## Opções

| Opção | A favor | Contra |
| --- | --- | --- |
| Monólito simples (como o MetaSenior) | Mais rápido no início | Repete os problemas do MetaSenior; acoplamento cresce sem controlo |
| **Monólito modular** | Um deploy, uma base de dados, transações simples; fronteiras explícitas e verificadas no CI; cada módulo pode sair para um serviço se um dia for preciso | Exige disciplina e regras de lint |
| Microserviços | Escala e deploy independentes | Custo operacional, latência, consistência distribuída e superfície de ataque desproporcionados para 2 pessoas |

## Decisão

**Monólito modular**, num **monorepo pnpm + Turborepo**:

```
apps/
  web/                 Next.js: páginas, server actions, rotas de API (fina: valida, autoriza, chama o domínio)
packages/
  domain/              Regras de negócio puras (sem Next, React, Prisma); 100% testável
  db/                  Prisma: schema, migrações, extensão de tenant, repositórios
  ui/                  Componentes partilhados
  config/              tsconfig, eslint, prettier partilhados
  testing/             Fábricas de dados fictícios e utilitários de teste
services/
  ml/                  Python (só quando existir a Fase 4)
```

Módulos de domínio iniciais, cada um com uma API pública (`index.ts`):
`identity`, `facility`, `residents`, `care`, `floorplan`, `alerts`, `integrations`, `audit`.

### Regras

1. `packages/domain` não importa Next, React, Prisma nem nada de rede.
2. Um módulo só importa a API pública de outro, nunca ficheiros internos.
3. `apps/web` não contém regras de negócio: valida a entrada (Zod), autoriza, chama o domínio, responde.
4. As regras 1 e 2 são verificadas no CI (dependency-cruiser); um PR que as viole não passa.
5. O serviço de ML, quando existir, fala com o monólito por uma API interna versionada e
   recebe apenas dados pseudonimizados.

## Consequências

- **Positivas:** um só deploy e uma só base de dados; testes rápidos do domínio; fronteiras
  claras que permitem extrair um módulo mais tarde sem reescrever.
- **Negativas:** o deploy é único, por isso um erro num módulo pode afetar os outros
  (mitigado por testes, previews por PR e observabilidade).
- **A rever** se houver mais de 20 lares ou uma equipa com mais de 5 programadores.
