import { describe, expect, it } from 'vitest';
import { getAppStatus } from './status';

describe('getAppStatus', () => {
  it('Dado o ambiente da Vercel, então mostra o ambiente e o commit curto', () => {
    const s = getAppStatus({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_SHA: 'abcdef1234567' });
    expect(s.environment).toBe('preview');
    expect(s.commit).toBe('abcdef1');
  });

  it('Dado o ambiente local, então usa development e não tem commit', () => {
    const s = getAppStatus({});
    expect(s.environment).toBe('development');
    expect(s.commit).toBeNull();
  });

  it('carrega o lar piloto simulado através do domínio', () => {
    expect(getAppStatus({}).facility).toMatchObject({ floors: 3, rooms: 50, beds: 100, erpiErrors: 0 });
  });
});
