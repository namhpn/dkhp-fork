import { parseSearchTokens, parseSearchTokensLower, rowMatchesToken, getFirstMatchingTokenLabel } from './utils';
import type { ClassModel } from 'types';

// ── Test fixtures ──────────────────────────────────────────────────────────
const makeRow = (overrides: Partial<ClassModel> = {}): ClassModel => ({
  STT: 1,
  MaMH: 'IT003',
  MaLop: 'IT003.O22',
  TenMH: 'Lập trình Web',
  TenGV: 'Nguyen Van A',
  MaGV: 'GV001',
  SiSo: '60',
  PhongHoc: 'B4.01',
  SoTc: 3,
  ThucHanh: 0,
  HTGD: 'LT',
  Thu: '2',
  Tiet: '1,2,3',
  CachTuan: '',
  KhoaHoc: '2022',
  HocKy: '1',
  NamHoc: '2024-2025',
  HeDT: 'ĐH',
  KhoaQL: 'CNTT',
  NBD: '',
  NKT: '',
  GhiChu: '',
  NgonNgu: '',
  ...overrides,
});

// ── parseSearchTokens ──────────────────────────────────────────────────────
describe('parseSearchTokens', () => {
  it('splits by semicolon and trims', () => {
    expect(parseSearchTokens('IT003; EC201; Nguyen')).toEqual(['IT003', 'EC201', 'Nguyen']);
  });

  it('drops empty tokens', () => {
    expect(parseSearchTokens('IT003;;EC201')).toEqual(['IT003', 'EC201']);
    expect(parseSearchTokens(';IT003;')).toEqual(['IT003']);
    expect(parseSearchTokens(';;;')).toEqual([]);
  });

  it('returns empty for whitespace-only input', () => {
    expect(parseSearchTokens('')).toEqual([]);
    expect(parseSearchTokens('   ')).toEqual([]);
    expect(parseSearchTokens(' ; ; ')).toEqual([]);
  });

  it('preserves original casing in display labels', () => {
    expect(parseSearchTokens('it003; NGUYEN')).toEqual(['it003', 'NGUYEN']);
  });

  it('handles single token', () => {
    expect(parseSearchTokens('Nguyen')).toEqual(['Nguyen']);
  });
});

// ── parseSearchTokensLower ─────────────────────────────────────────────────
describe('parseSearchTokensLower', () => {
  it('returns lower-cased tokens', () => {
    expect(parseSearchTokensLower('IT003; EC201')).toEqual(['it003', 'ec201']);
  });
});

// ── rowMatchesToken ────────────────────────────────────────────────────────
describe('rowMatchesToken', () => {
  const row = makeRow();

  it('matches MaMH (via MonHoc valueGetter)', () => {
    expect(rowMatchesToken(row, 'it003')).toBe(true);
  });

  it('matches TenMH substring (via MonHoc)', () => {
    expect(rowMatchesToken(row, 'lập trình')).toBe(true);
  });

  it('matches MaLop substring', () => {
    expect(rowMatchesToken(row, 'o22')).toBe(true);
  });

  it('matches TenGV substring', () => {
    expect(rowMatchesToken(row, 'nguyen')).toBe(true);
  });

  it('is case-insensitive (caller lowercases token)', () => {
    // rowMatchesToken expects a pre-lowered token; search pipeline lowercases before calling
    expect(rowMatchesToken(row, 'nguyen')).toBe(true);
    expect(rowMatchesToken(row, 'it003')).toBe(true);
  });

  it('does not match unrelated text', () => {
    expect(rowMatchesToken(row, 'ec201')).toBe(false);
    expect(rowMatchesToken(row, 'phantom')).toBe(false);
  });

  it('handles TenGV undefined', () => {
    const rowNoGV = makeRow({ TenGV: undefined });
    expect(rowMatchesToken(rowNoGV, 'nguyen')).toBe(false);
    expect(rowMatchesToken(rowNoGV, 'it003')).toBe(true);
  });

  it('handles empty TenMH + MaMH (empty MonHoc)', () => {
    const rowEmpty = makeRow({ MaMH: '', TenMH: '' });
    expect(rowMatchesToken(rowEmpty, 'lập trình')).toBe(false);
  });
});

// ── getFirstMatchingTokenLabel (dedup-first-match) ─────────────────────────
describe('getFirstMatchingTokenLabel', () => {
  const row = makeRow({ MaLop: 'IT003.O22', TenGV: 'Nguyen Van A' });

  it('returns first matching token in input order', () => {
    const result = getFirstMatchingTokenLabel(row, ['IT003', 'Nguyen']);
    expect(result).toBe('IT003');
  });

  it('returns second token if only second matches', () => {
    const result = getFirstMatchingTokenLabel(row, ['EC201', 'Nguyen']);
    expect(result).toBe('Nguyen');
  });

  it('returns null if no token matches', () => {
    expect(getFirstMatchingTokenLabel(row, ['EC201', 'PH001'])).toBeNull();
  });

  it('returns null for empty tokens', () => {
    expect(getFirstMatchingTokenLabel(row, [])).toBeNull();
  });

  it('preserves original casing of the matching token', () => {
    const result = getFirstMatchingTokenLabel(row, ['nguyen']);
    expect(result).toBe('nguyen');
  });

  it('dedup: row matching multiple tokens appears under first only', () => {
    const tokens = ['O22', 'Nguyen', 'IT003'];
    expect(getFirstMatchingTokenLabel(row, tokens)).toBe('O22');
  });
});
