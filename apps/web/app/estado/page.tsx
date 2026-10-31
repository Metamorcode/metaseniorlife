import { getAppStatus } from '@/lib/status';

export const dynamic = 'force-dynamic';

export default function EstadoPage() {
  const s = getAppStatus();
  const rows: [string, string | number][] = [
    ['Versão', s.version],
    ['Ambiente', s.environment],
    ['Commit', s.commit ?? 'local'],
    ['Lar de demonstração', s.facility.name],
    ['Pisos', s.facility.floors],
    ['Quartos', s.facility.rooms],
    ['Camas', s.facility.beds],
    ['Erros de conformidade ERPI', s.facility.erpiErrors],
  ];

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wider text-care">MetaSeniorLife</p>
      <h1 className="mt-1 text-3xl font-bold">Estado da aplicação</h1>
      <p className="mt-2 text-sm opacity-70">
        Página técnica para confirmar que cada deploy arranca e lê o domínio. Usa apenas dados fictícios.
      </p>
      <dl className="mt-8 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-3">
            <dt className="opacity-70">{label}</dt>
            <dd className="font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
