import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEventHandler, DragEventHandler, useState } from 'react';
import { selectDataExcel, useTkbStore } from '../../zus';
import { useExcelImport } from './useExcelImport';

function SelectExcelButton() {
  const dataExcel = useTkbStore(selectDataExcel);
  const { isImporting, processFile, handleFileChange, sheetJSFT } = useExcelImport();
  const [isDragOver, setIsDragOver] = useState(false);
  const hasFile = !!dataExcel?.data?.length;

  const handleUploadFileExcel = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      handleFileChange(event);
    },
    [handleFileChange],
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