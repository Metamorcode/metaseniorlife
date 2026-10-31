import { expandFacility, summarize, validateErpi, type FacilityTemplate } from '@msl/domain';
import piloto from '../../../templates/lar-piloto-simulado.json';

export interface AppStatus {
  version: string;
  environment: string;
  commit: string | null;
  facility: { name: string; floors: number; rooms: number; beds: number; erpiErrors: number };
}

/** Estado da aplicação para a página /estado: prova que a app arranca e fala com o domínio. */
export function getAppStatus(env: Record<string, string | undefined> = process.env): AppStatus {
  const facility = expandFacility(piloto as FacilityTemplate);
  const summary = summarize(facility);
  return {
    version: env.npm_package_version ?? '0.1.0',
    environment: env.VERCEL_ENV ?? env.NODE_ENV ?? 'development',
    commit: env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    facility: {
      name: facility.name,
      floors: facility.floors.length,
      rooms: summary.rooms,
      beds: summary.capacity,
      erpiErrors: validateErpi(facility).filter((f) => f.severity === 'erro').length,
    },
  };
}
