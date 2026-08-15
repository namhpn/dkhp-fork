import ExcelJS from 'exceljs';
import { enqueueSnackbar } from 'notistack';
import { ChangeEventHandler, useCallback, useRef, useState } from 'react';
import { useTkbStore } from '../../zus';
import { arrayToTkbObject, sheetJSFT, toDateTimeString } from './utils';

export function useExcelImport() {
  const setDataExcel = useTkbStore((s) => s.setDataExcel);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (isImporting) return;
      setIsImporting(true);

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const buffer = e?.target?.result as ArrayBuffer;
          const wb = new ExcelJS.Workbook();
          await wb.xlsx.load(buffer);

          const wsLyThuyet = wb.worksheets[0];
          const wsThucHanh = wb.worksheets[1];

          const sheetToRows = (ws: ExcelJS.Worksheet): any[][] => {
            const rows: any[][] = [];
            ws.eachRow({ includeEmpty: false }, (row) => {
              const vals = row.values as any[];
              // row.values is 1-indexed; drop the leading undefined
              rows.push(vals.slice(1));
            });
            return rows;
          };

          const dataLyThuyet = sheetToRows(wsLyThuyet);
          const dataThucHanh = wsThucHanh ? sheetToRows(wsThucHanh) : [];
          const dataInArray = [...dataLyThuyet, ...dataThucHanh].filter((row) => typeof row[0] === 'number');

          if (!dataInArray.length) {
            enqueueSnackbar('File không đúng định dạng thời khóa biểu.', { variant: 'error' });
            return;
          }

          const now = new Date();
          setDataExcel({
            data: dataInArray.map((array) => arrayToTkbObject(array)),
            fileName: file.name,
            lastUpdateTimestamp: now.getTime(),
            lastUpdate: toDateTimeString(now),
          });
        } catch {
          enqueueSnackbar('Không đọc được file Excel.', { variant: 'error' });
        } finally {
          setIsImporting(false);
        }
      };

      reader.onerror = () => {
        setIsImporting(false);
        enqueueSnackbar('Không đọc được file Excel.', { variant: 'error' });
      };

      reader.readAsArrayBuffer(file);
    },
    [isImporting, setDataExcel],
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      processFile(file);
      event.target.value = '';
    },
    [processFile],
  );

  return {
    isImporting,
    processFile,
    triggerFileInput,
    fileInputRef,
    handleFileChange,
    sheetJSFT,
  };
}
