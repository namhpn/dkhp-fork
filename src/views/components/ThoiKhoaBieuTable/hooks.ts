import constate from 'constate';
import React from 'react';
import { enqueueSnackbar } from 'notistack';
import { ClassModel } from '../../../types';
import { findOverlapedClasses, getDanhSachTiet } from '../../../utils';
import { selectPhanLoaiHocTrenTruong, useTkbStore } from '../../../zus';
import { downloadFromCanvas, getTietIndex, TKB_EXPORT_WIDTH_PX } from './utils';

/* // Uncomment to see how rowData can be conducted:
const rowDataExample = [
  { Thu2: {  }, Thu3: {  }, Thu4: {  }, Thu5: null, Thu6: null, Thu7: null }, // tiet 1
  { Thu2: 'xx', Thu3: 'xx', Thu4: 'xx', Thu5: null, Thu6: {  }, Thu7: null }, // tiet 2
  { Thu2: 'xx', Thu3: 'xx', Thu4: 'xx', Thu5: null, Thu6: 'xx', Thu7: null }, // tiet 3
  { Thu2: {  }, Thu3: 'xx', Thu4: 'xx', Thu5: null, Thu6: 'xx', Thu7: null }, // tiet 4
  { Thu2: 'xx', Thu3: 'xx', Thu4: null, Thu5: null, Thu6: 'xx', Thu7: null }, // tiet 5
  { Thu2: {  }, Thu3: null, Thu4: {  }, Thu5: {  }, Thu6: null, Thu7: null }, // tiet 6
  { Thu2: 'xx', Thu3: null, Thu4: 'xx', Thu5: 'xx', Thu6: null, Thu7: null }, // tiet 7
  { Thu2: 'xx', Thu3: null, Thu4: 'xx', Thu5: 'xx', Thu6: null, Thu7: null }, // tiet 8
  { Thu2: 'xx', Thu3: null, Thu4: 'xx', Thu5: null, Thu6: null, Thu7: null }, // tiet 9
  { Thu2: 'xx', Thu3: null, Thu4: 'xx', Thu5: null, Thu6: null, Thu7: null }, // tiet 10
];
*/

export const CELL = {
  /** không có lớp học vào thời điểm này */
  NO_CLASS: null,
  /** có lớp học vào thời điểm này, nhưng sẽ được render đè bởi cell khác (lớp có tiết 12345 thì chỉ tiết 1 là phải render) */
  OCCUPIED: 'xx',
} as const;

type CellData = typeof CELL.NO_CLASS | typeof CELL.OCCUPIED | ClassModel;
export type RowData = {
  Thu2: CellData;
  Thu3: CellData;
  Thu4: CellData;
  Thu5: CellData;
  Thu6: CellData;
  Thu7: CellData;
};
type TableData = RowData[];

const MIN_VISIBLE_ROWS = 10;
const MAX_ROWS = 14;
const ROW_BUFFER_AFTER_LAST = 1;

export const isRowEmpty = (row: RowData): boolean => Object.values(row).every((cell) => cell === CELL.NO_CLASS);

export const getLastOccupiedRowIndex = (rows: TableData): number => {
  for (let i = rows.length - 1; i >= 0; i--) {
    if (!isRowEmpty(rows[i])) return i;
  }
  return -1;
};

/** Show rows with content + 1 buffer, at least MIN_VISIBLE_ROWS for context. */
export const getVisibleRowCount = (rows: TableData): number => {
  const lastOccupied = getLastOccupiedRowIndex(rows);
  if (lastOccupied < 0) return MIN_VISIBLE_ROWS;
  return Math.min(MAX_ROWS, Math.max(MIN_VISIBLE_ROWS, lastOccupied + 1 + ROW_BUFFER_AFTER_LAST));
};

const initTableData = () => {
  const tableData: TableData = [];
  for (let i = 0; i < 14; i++) {
    tableData.push({
      Thu2: CELL.NO_CLASS,
      Thu3: CELL.NO_CLASS,
      Thu4: CELL.NO_CLASS,
      Thu5: CELL.NO_CLASS,
      Thu6: CELL.NO_CLASS,
      Thu7: CELL.NO_CLASS,
    });
  }
  return tableData;
};

// Phân loại data thành các lớp học trên trường & các lớp HT2
// Đồng thời tái cấu trúc CTDL nhằm tiện vẽ TKB hơn
const usePhanLoaiHocTrenTruong = () => {
  const [khongHocTrenTruong, hocTrenTruong] = useTkbStore(selectPhanLoaiHocTrenTruong);

  const { kept, redundant } = findOverlapedClasses(hocTrenTruong);

  const rowDataHocTrenTruong = React.useMemo(() => {
    const tableData = initTableData();

    for (const lop of kept) {
      const listTiet = getDanhSachTiet(lop.Tiet);

      const tietBatDau = listTiet[0];
      tableData[getTietIndex(tietBatDau)]['Thu' + lop.Thu] = lop;

      for (let i = 1; i < listTiet.length; i++) {
        tableData[getTietIndex(listTiet[i])]['Thu' + lop.Thu] = CELL.OCCUPIED;
      }
    }

    return tableData;
  }, [kept]);

  return {
    redundant,
    khongHocTrenTruong,
    rowDataHocTrenTruong,
  };
};

export const [PhanLoaiHocTrenTruongContext, usePhanLoaiHocTrenTruongContext] = constate(usePhanLoaiHocTrenTruong);

export const useProcessImageTkb = () => {
  const tkbTableRef = React.useRef<HTMLDivElement>(null);

  const saveTkbImageToComputer = React.useCallback(async () => {
    try {
      if (!tkbTableRef.current) return;
      // Loaded on demand: html2canvas (~6% of the old entry chunk) only runs for this export click.
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(tkbTableRef.current, {
        backgroundColor: '#ffffff',
        scale: Math.min(window.devicePixelRatio || 1, 2),
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.backgroundColor = '#ffffff';

          const exportRoot = clonedDoc.getElementById('thoi-khoa-bieu-export');
          const exportTable = exportRoot?.querySelector('table');
          if (exportRoot) {
            exportRoot.style.width = `${TKB_EXPORT_WIDTH_PX}px`;
            exportRoot.style.maxWidth = `${TKB_EXPORT_WIDTH_PX}px`;
          }
          if (exportTable instanceof HTMLTableElement) {
            exportTable.style.width = `${TKB_EXPORT_WIDTH_PX}px`;
            exportTable.style.minWidth = `${TKB_EXPORT_WIDTH_PX}px`;
            exportTable.style.maxWidth = `${TKB_EXPORT_WIDTH_PX}px`;
            exportTable.style.tableLayout = 'fixed';
          }
        },
      });
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      downloadFromCanvas(canvas, `tkb-courses-${yyyy}-${mm}-${dd}.png`);
    } catch {
      enqueueSnackbar('Tải ảnh TKB thất bại, vui lòng thử lại.', { variant: 'error' });
    }
  }, []);

  return {
    tkbTableRef,
    saveTkbImageToComputer,
  };
};
