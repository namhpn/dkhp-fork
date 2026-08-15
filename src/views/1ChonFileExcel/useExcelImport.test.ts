import ExcelJS from 'exceljs';

/**
 * Tests for ThucHanh sheet-origin normalization in useExcelImport.
 *
 * We exercise the core logic directly (tagging rows with fromSheet and
 * overriding ThucHanh) rather than the full React hook, because the hook
 * depends on FileReader + notistack which are hard to mock in jsdom.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal ExcelJS Worksheet mock that yields the given rows. */
function mockWorksheet(rows: any[][]): ExcelJS.Worksheet {
  return {
    eachRow: (_opts: any, cb: (row: any, index: number) => void) => {
      rows.forEach((vals, i) => {
        // ExcelJS row.values is 1-indexed; prepend undefined at index 0
        cb({ values: [undefined, ...vals] }, i + 1);
      });
    },
  } as unknown as ExcelJS.Worksheet;
}

/**
 * Simulate the import logic from useExcelImport: tag each row with its sheet
 * origin, merge, filter headers, and normalize ThucHanh.
 */
function simulateImport(sheet1Rows: any[][], sheet2Rows?: any[][]) {
  const wsLyThuyet = mockWorksheet(sheet1Rows);
  const wsThucHanh = sheet2Rows ? mockWorksheet(sheet2Rows) : undefined;

  const sheetToRows = (ws: ExcelJS.Worksheet): any[][] => {
    const rows: any[][] = [];
    ws.eachRow({ includeEmpty: false }, (row: any) => {
      const vals = row.values as any[];
      rows.push(vals.slice(1));
    });
    return rows;
  };

  const dataLyThuyet = sheetToRows(wsLyThuyet).map((row) => ({ row, fromSheet: 'LT' as const }));
  const dataThucHanh = wsThucHanh
    ? sheetToRows(wsThucHanh).map((row) => ({ row, fromSheet: 'TH' as const }))
    : [];

  const dataInArray = [...dataLyThuyet, ...dataThucHanh].filter(
    ({ row }) => typeof row[0] === 'number',
  );

  return dataInArray.map(({ row, fromSheet }) => {
    const obj = {
      STT: row[0],
      MaMH: row[1],
      MaLop: row[2],
      TenMH: row[3],
      MaGV: row[4],
      TenGV: row[5],
      SiSo: row[6],
      SoTc: parseInt(row[7]),
      ThucHanh: row[8],
      HTGD: row[9],
      Thu: String(row[10]),
      Tiet: String(row[11]),
      CachTuan: String(row[12]),
      PhongHoc: row[13],
      KhoaHoc: String(row[14]),
      HocKy: String(row[15]),
      NamHoc: String(row[16]),
      HeDT: row[17],
      KhoaQL: row[18],
      NBD: row[19],
      NKT: row[20],
      GhiChu: row[21],
      NgonNgu: row[22],
    };
    if (fromSheet === 'LT') {
      obj.ThucHanh = 0;
    } else {
      obj.ThucHanh = Number(obj.ThucHanh) || 1;
    }
    return obj;
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Minimal LT row array (23 columns matching arrayToTkbObject mapping). */
const LT_ROW: any[] = [
  1,              // [0]  STT
  'IT001',        // [1]  MaMH
  'IT001.O21',    // [2]  MaLop
  'Nhap mon',     // [3]  TenMH
  'GV01',         // [4]  MaGV
  'Nguyen Van A', // [5]  TenGV
  '60',           // [6]  SiSo
  '3',            // [7]  SoTc
  5,              // [8]  ThucHanh (unreliable in Sheet 1)
  'LT',           // [9]  HTGD
  '2',            // [10] Thu
  '123',          // [11] Tiet
  '0',            // [12] CachTuan
  'C101',         // [13] PhongHoc
  '2021',         // [14] KhoaHoc
  '1',            // [15] HocKy
  '2024-2025',    // [16] NamHoc
  'CQ',           // [17] HeDT
  'CNTT',         // [18] KhoaQL
  '2024-09-01',   // [19] NBD
  '2025-01-15',   // [20] NKT
  '',             // [21] GhiChu
  'VN',           // [22] NgonNgu
];

/** Minimal TH row array. */
const TH_ROW: any[] = [
  2,              // [0]  STT
  'IT001',        // [1]  MaMH
  'IT001.O21.1',  // [2]  MaLop
  'Nhap mon',     // [3]  TenMH
  'GV02',         // [4]  MaGV
  'Tran Van B',   // [5]  TenGV
  '30',           // [6]  SiSo
  '1',            // [7]  SoTc
  1,              // [8]  ThucHanh (reliable in Sheet 2)
  'TH',           // [9]  HTGD
  '3',            // [10] Thu
  '45',           // [11] Tiet
  '0',            // [12] CachTuan
  'P102',         // [13] PhongHoc
  '2021',         // [14] KhoaHoc
  '1',            // [15] HocKy
  '2024-2025',    // [16] NamHoc
  'CQ',           // [17] HeDT
  'CNTT',         // [18] KhoaQL
  '2024-09-01',   // [19] NBD
  '2025-01-15',   // [20] NKT
  '',             // [21] GhiChu
  'VN',           // [22] NgonNgu
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useExcelImport — ThucHanh sheet-origin normalization', () => {
  it('forces ThucHanh=0 for Sheet 1 rows even when column 8 has a non-zero value', () => {
    const result = simulateImport([LT_ROW]);
    expect(result).toHaveLength(1);
    expect(result[0].ThucHanh).toBe(0);
  });

  it('preserves ThucHanh=1 for Sheet 2 rows', () => {
    const result = simulateImport([], [TH_ROW]);
    expect(result).toHaveLength(1);
    expect(result[0].ThucHanh).toBe(1);
  });

  it('normalizes ThucHanh from string "1" to number 1 for Sheet 2 rows', () => {
    const thWithString = [...TH_ROW];
    thWithString[8] = '1';
    const result = simulateImport([], [thWithString]);
    expect(result).toHaveLength(1);
    expect(result[0].ThucHanh).toBe(1);
    expect(typeof result[0].ThucHanh).toBe('number');
  });

  it('defaults ThucHanh to 1 for Sheet 2 rows when column 8 is undefined', () => {
    const thWithUndefined = [...TH_ROW];
    thWithUndefined[8] = undefined;
    const result = simulateImport([], [thWithUndefined]);
    expect(result).toHaveLength(1);
    expect(result[0].ThucHanh).toBe(1);
  });

  it('handles missing Sheet 2 gracefully — only LT data, no crash', () => {
    const result = simulateImport([LT_ROW], undefined);
    expect(result).toHaveLength(1);
    expect(result[0].ThucHanh).toBe(0);
  });

  it('filters out header rows where row[0] is not a number', () => {
    const headerRow = [
      'STT', 'MaMH', 'MaLop', 'TenMH', 'MaGV', 'TenGV', 'SiSo', 'SoTc',
      'ThucHanh', 'HTGD', 'Thu', 'Tiet', 'CachTuan', 'PhongHoc', 'KhoaHoc',
      'HocKy', 'NamHoc', 'HeDT', 'KhoaQL', 'NBD', 'NKT', 'GhiChu', 'NgonNgu',
    ];
    const result = simulateImport([headerRow, LT_ROW], [headerRow, TH_ROW]);
    // Header rows should be excluded
    expect(result).toHaveLength(2);
    expect(result[0].STT).toBe(1);
    expect(result[1].STT).toBe(2);
  });

  it('merges LT and TH rows in correct order (LT first, then TH)', () => {
    const result = simulateImport([LT_ROW], [TH_ROW]);
    expect(result).toHaveLength(2);
    expect(result[0].MaLop).toBe('IT001.O21');
    expect(result[0].ThucHanh).toBe(0);
    expect(result[1].MaLop).toBe('IT001.O21.1');
    expect(result[1].ThucHanh).toBe(1);
  });
});
