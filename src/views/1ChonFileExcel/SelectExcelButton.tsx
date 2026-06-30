import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEventHandler, DragEventHandler, useState } from 'react';
import XLSX from 'xlsx';
import { selectDataExcel, useTkbStore } from '../../zus';
import { arrayToTkbObject, getLastUpdateString, sheetJSFT, toDateTimeString } from './utils';

function SelectExcelButton() {
  const dataExcel = useTkbStore(selectDataExcel);
  const setDataExcel = useTkbStore((s) => s.setDataExcel);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const lastUpdateString = getLastUpdateString(dataExcel);
  const hasFile = !!dataExcel?.data?.length;
  const rowCount = dataExcel?.data?.length ?? 0;

  const processFile = React.useCallback(
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
          enqueueSnackbar(`Đã nhập ${file.name}.`, { variant: 'success' });
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

  const handleUploadFileExcel = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      processFile(file);
      event.target.value = '';
    },
    [processFile],
  );

  const handleDragOver = React.useCallback<DragEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = React.useCallback<DragEventHandler<HTMLDivElement>>((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback<DragEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer?.files?.[0];
      if (!file) return;

      // Validate file extension
      const validExtensions = ['.xlsx', '.xlsb', '.xlsm', '.xls', '.csv'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(ext)) {
        enqueueSnackbar('Chỉ chấp nhận file Excel (.xlsx, .xls, .csv).', { variant: 'error' });
        return;
      }

      processFile(file);
    },
    [processFile],
  );

  return (
    <div className="upload-zone">
      <div
        className={'upload-drop-panel' + (isDragOver ? ' drag-over' : '')}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-busy={isImporting}
        aria-label="Khu vực tải file Excel"
      >
        <div className="upload-main">
          <div className="upload-icon-box" aria-hidden="true">
            {isImporting ? (
              <CircularProgress size={20} />
            ) : hasFile ? (
              <CheckCircleOutlineIcon fontSize="medium" color="success" />
            ) : (
              <CloudUploadOutlinedIcon fontSize="medium" />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <Typography component="h3" className="upload-title">
              {isImporting ? 'Đang đọc file…' : 'Chọn file thời khóa biểu'}
            </Typography>
            <Typography className="upload-file-name">
              {isImporting
                ? 'Vui lòng đợi…'
                : dataExcel?.fileName || 'Kéo thả file Excel vào đây'}
            </Typography>
            {hasFile && !isImporting && (
              <Typography className="upload-status">
                {rowCount} lớp học{lastUpdateString ? ` · ${lastUpdateString}` : ''}
              </Typography>
            )}
          </div>
        </div>

        <div className="upload-actions">
          <Button
            variant={hasFile ? 'outlined' : 'contained'}
            component="label"
            disabled={isImporting}
            startIcon={isImporting ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {isImporting ? 'Đang đọc…' : hasFile ? 'Đổi file' : 'Chọn file Excel'}
            <input
              type="file"
              style={{ display: 'none' }}
              accept={sheetJSFT}
              onChange={handleUploadFileExcel}
              disabled={isImporting}
            />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SelectExcelButton;
