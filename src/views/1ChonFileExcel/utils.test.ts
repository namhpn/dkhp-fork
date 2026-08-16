import { arrayToTkbObject } from './utils';

/** Row prefix [0..18]; NBD/NKT cells are appended per test. */
const BASE_ROW = [
  1, // STT
  'IT001', // MaMH
  'IT001.O21', // MaLop
  'Nhập môn lập trình', // TenMH
  'GV01', // MaGV
  'Nguyễn Văn A', // TenGV
  60, // SiSo
  '3', // SoTc
  0, // ThucHanh
  'LT', // HTGD
  2, // Thu
  '123', // Tiet
  '0', // CachTuan
  'C101', // PhongHoc
  '2021', // KhoaHoc
  '1', // HocKy
  '2024-2025', // NamHoc
  'CQ', // HeDT
  'CNTT', // KhoaQL
];

describe('arrayToTkbObject — NBD/NKT handling', () => {
  it('converts numeric excel serial dates to yyyy-MM-dd strings', () => {
    // Exact day mapping is tz-history sensitive (1899 local-LMT base) — assert shape only.
    const obj = arrayToTkbObject([...BASE_ROW, 45535, 45671]);
    expect(obj.NBD).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(obj.NKT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('passes string dates through unchanged', () => {
    const obj = arrayToTkbObject([...BASE_ROW, '2024-09-01', '2025-01-15']);
    expect(obj.NBD).toBe('2024-09-01');
    expect(obj.NKT).toBe('2025-01-15');
  });

  it('returns empty strings when the file has no NBD/NKT columns (short row)', () => {
    const obj = arrayToTkbObject([...BASE_ROW]);
    expect(obj.NBD).toBe('');
    expect(obj.NKT).toBe('');
  });

  it('returns empty strings when NBD/NKT cells are undefined or null', () => {
    const obj = arrayToTkbObject([...BASE_ROW, undefined, null]);
    expect(obj.NBD).toBe('');
    expect(obj.NKT).toBe('');
  });

  it('returns empty strings when NBD/NKT cells are non-numeric garbage', () => {
    const obj = arrayToTkbObject([...BASE_ROW, 'not-a-date', {}]);
    expect(obj.NBD).toBe('not-a-date'); // strings are trusted as-is
    expect(obj.NKT).toBe('');
  });
});
