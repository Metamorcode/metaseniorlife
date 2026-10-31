# Contribuir

## Fluxo

1. A tarefa está no backlog com critérios de aceitação.
2. Se é uma funcionalidade nova, cria-se `specs/NNN-nome/` com `spec.md` (o quê e porquê),
   `plan.md` (como) e `tasks.md` (passos), antes de haver código.
3. Um branch por tarefa: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
4. Testes primeiro para a lógica de domínio; o código vem a seguir.
5. PR pequeno, com a spec ligada, o que mudou, como testar e riscos.
6. Merge só com CI verde e revisão aprovada.

## Commits

Conventional Commits, em português, no imperativo:

```
feat(domain): calcular estado do relógio de cuidado
fix(tablet): não duplicar registos ao reenviar
docs(adr): aceitar ADR-001
```

## Regras de código

- TypeScript `strict`. Nada de `any` sem justificação num comentário.
- O domínio (`packages/domain`) não depende de Next, React nem Prisma.
- Um módulo só usa a API pública de outro (`index.ts`).
- Comentários explicam o porquê, não o quê.
- Nomes em inglês no código; textos para o utilizador e documentação em português.

## Dados

- Nunca dados reais de residentes ou profissionais em código, testes, seeds, logs ou issues.
- Segredos só nas variáveis de ambiente da plataforma. Nunca no repositório nem no chat.
