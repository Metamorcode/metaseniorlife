# 003 · Modelo de lar editável

## Porquê
Cada lar tem um edifício diferente. A estrutura (pisos, quartos, camas, espaços) é a base da
planta viva, dos tablets das portas e dos relógios de limpeza. Tem de ser configurável por
cliente sem mexer em código, e o sistema deve avisar cedo quando um edifício não cumpre a lei.

## O quê
- Um template JSON por lar (`templates/*.json`), compacto: grupos de quartos iguais por piso
  e lista de espaços comuns.
- `expandFacility` gera quartos e camas com códigos estáveis (`1.07`, `1.07-B`).
- `validateErpi` verifica o edifício contra a Portaria n.º 67/2012 (redação da Portaria
  n.º 349/2023) e devolve erros e avisos com a norma citada.
- Intervalos de limpeza por tipo de espaço, com valores por omissão e sobreposição no template.

## Critérios de aceitação
1. Dado o template `lar-piloto-simulado`, quando é expandido, então tem 3 pisos, 50 quartos e
   100 camas, e a validação não tem erros.
2. Dado o template `lar-40-quartos-briefing` (quartos de 4 camas), quando é validado, então
   aponta cada quarto de 4 camas e o excesso de triplos.
3. Dado um quarto abaixo da área mínima (10 / 12 casal / 16 / 20,5 m²), então há um erro por quarto.
4. Dado um lar com mais de 20 residentes, então exige ≥ 20% de individuais, ≤ 20% de triplos,
   compartimento de sujos por piso com quartos, banho geriátrico ≥ 10 m² e sala de estar com copa.
5. Dado um lar com mais de 80 residentes, então exige unidades funcionais de no máximo 60.
6. Dado WC partilhado, então exige uma instalação sanitária por cada 4 residentes no piso.

## Fora de âmbito
- Editor visual do template (fica para a gestão da estrutura do lar, MSL-024).
- Geometria da planta (posições e formas), que vem com a planta 2D (MSL-034).

## Nota
A validação é uma verificação prévia para conversar com o arquiteto; não substitui o parecer
do ISS nem o projeto de licenciamento.
