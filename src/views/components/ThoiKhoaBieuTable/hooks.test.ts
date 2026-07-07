import { CELL, getVisibleRowCount, type RowData } from './hooks';

const emptyRow = (): RowData => ({
  Thu2: CELL.NO_CLASS,
  Thu3: CELL.NO_CLASS,
  Thu4: CELL.NO_CLASS,
  Thu5: CELL.NO_CLASS,
  Thu6: CELL.NO_CLASS,
  Thu7: CELL.NO_CLASS,
});

const makeRows = (length: number): RowData[] => Array.from({ length }, emptyRow);

test('getVisibleRowCount caps export at 10 rows when evening and online slots are empty', () => {
  const rows = makeRows(14);
  rows[3].Thu2 = { MaLop: 'CS101' } as RowData['Thu2'];

  expect(getVisibleRowCount(rows)).toBe(10);
});

test('getVisibleRowCount includes occupied evening rows when classes use them', () => {
  const rows = makeRows(14);
  rows[10].Thu3 = { MaLop: 'CS202' } as RowData['Thu3'];

  expect(getVisibleRowCount(rows)).toBe(12);
});