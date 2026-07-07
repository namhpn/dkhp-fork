import { enqueueSnackbar } from 'notistack';
import { ChangeEventHandler, useCallback, useRef, useState } from 'react';
import XLSX from 'xlsx';
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
      const rABS = !!reader.readAsBinaryString;

      reader.onload = (e) => {
        try {
          const bstr = e?.target?.result;
          const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
          const wsLyThuyet = wb.Sheets[wb.SheetNames[0]];
          const wsThucHanh = wb.Sheets[wb.SheetNames[1]];
          const dataLyThuyet = XLSX.utils.sheet_to_json<any[][]>(wsLyThuyet, { header: 1 });
          const dataThucHanh = XLSX.utils.sheet_to_json<any[][]>(wsThucHanh, { header: 1 });
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

      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
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