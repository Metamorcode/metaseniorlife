# ADR-003 · Ambientes, planos e custos

- **Estado:** Proposto
- **Data:** 2026-10-31
- **Depende de:** ADR-002

## Contexto

Queremos começar sem custos, mas o MetaSeniorLife vai guardar dados de saúde de residentes e
vai ser vendido. Os planos gratuitos têm limites que importam:

- **Vercel Hobby** é apenas para uso pessoal e não comercial; uso comercial exige Pro ou Enterprise.
  Protótipos de um produto comercial são aceites enquanto não houver clientes a pagar.
- **Supabase Free** pausa projetos após uma semana sem atividade, não tem backups automáticos
  nem recuperação a um ponto no tempo (PITR), e limita a base de dados a 500 MB.

## Decisão

| Ambiente | Onde | Dados | Plano |
| --- | --- | --- | --- |
| Local | Mac do Leo / sessão do Claude, Postgres em Docker | Fictícios (seed) | — |
| CI | GitHub Actions, Postgres como serviço | Fictícios | Gratuito |
| Preview | Vercel, um por PR | Fictícios | Hobby (enquanto protótipo) |
| Staging | Vercel + Supabase UE | Fictícios | Gratuito |
| Produção | Vercel + Supabase UE | **Reais** | **Pagos** |

### Regras

1. **Nenhum dado real de residentes ou profissionais fora de produção.** Nunca.
2. **Produção só existe em planos pagos**, antes do primeiro dado real: Vercel Pro e
   Supabase Pro com PITR, região UE.
3. Antes do piloto: DPIA concluída e contrato de subcontratação com o lar assinado.
4. Teste de restauro de backup mensal em produção, registado.

### Custo mensal estimado de produção (a confirmar no momento da compra)

| Serviço | Plano | Valor indicativo |
| --- | --- | --- |
| Vercel | Pro (1 lugar) | ~20 USD |
| Supabase | Pro + PITR 7 dias | ~25 USD + ~100 USD |
| Sentry | Developer (gratuito) ou Team | 0–26 USD |
| Domínio | — | ~1–2 EUR |
| **Total** | | **~150 USD/mês** |

O PITR é o maior custo e pode começar sem ele (backups diários do plano Pro + `pg_dump`
encriptado noturno) se o piloto aceitar perder no máximo 24 h de dados. A decisão fica com o
Leo e o lar, por escrito, na DPIA.

## Consequências

- Desenvolvimento e protótipo sem custos.
- O custo de produção (~150 USD/mês) tem de estar no preço por residente: com 100 residentes a
  €8, a mensalidade cobre-o várias vezes.
- Mudança para planos pagos é uma tarefa explícita do backlog (MSL-078), bloqueante para o piloto.
