# MetaSeniorLife

Cuidados ao residente para lares (ERPI), ligado ao MetaSenior. Responde a uma pergunta:
**quem cuidou de quem, quando, e quanto isso custou.**

## Estado

Em construção (Sprint 1 · Fundações). O backlog e o progresso estão no quadro do projeto.

## Requisitos

- Node 22 (ver `.nvmrc`)
- pnpm 10

## Começar

```bash
pnpm install
pnpm test
```

## Como trabalhamos

- **Spec Driven Development:** cada funcionalidade começa em `specs/NNN-nome/spec.md`, com
  critérios de aceitação em Dado/Quando/Então. Cada critério tem pelo menos um teste.
- **Decisões de arquitetura** ficam em `docs/adr/`.
- **Commits** pequenos no formato Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`…).
- **Pull requests** pequenos, revistos antes do merge, com CI verde.
- **Dados reais de residentes nunca entram no repositório nem em ambientes fora de produção.**

Ver [CONTRIBUTING.md](CONTRIBUTING.md).
