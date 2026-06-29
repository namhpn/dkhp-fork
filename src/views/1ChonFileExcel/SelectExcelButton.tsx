import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { enqueueSnackbar } from 'notistack';
import React, { ChangeEventHandler, useState } from 'react';
import XLSX from 'xlsx';
import { selectDataExcel, useTkbStore } from '../../zus';
import { arrayToTkbObject, getLastUpdateString, sheetJSFT, toDateTimeString } from './utils';

function SelectExcelButton() {
  const dataExcel = useTkbStore(selectDataExcel);
  const setDataExcel = useTkbStore((s) => s.setDataExcel);
  const [isImporting, setIsImporting] = useState(false);
  const lastUpdateString = getLastUpdateString(dataExcel);
  const hasFile = !!dataExcel?.data?.length;
  const rowCount = dataExcel?.data?.length ?? 0;

  const handleUploadFileExcel = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const file = event.target.files?.[0];
      if (!file || isImporting) return;

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
      event.target.value = '';
    },
    [isImporting, setDataExcel],
  );

  return (
    <div className="upload-zone">
      <div className="upload-drop-panel">
        <div className="upload-main">
          <div className="upload-icon-box" aria-hidden="true">
            {isImporting ? <CircularProgress size={22} /> : <FileUploadOutlinedIcon fontSize="medium" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <Typography component="h3" className="upload-title">
              File Excel thời khóa biểu
            </Typography>
            <Typography className="upload-file-name">{dataExcel?.fileName || 'Chưa chọn file'}</Typography>
            {hasFile && (
              <Typography className="upload-status">
                {rowCount} dòng{lastUpdateString ? ` · ${lastUpdateString}` : ''}
              </Typography>
            )}
          </div>
        </div>

        <div className="upload-actions">
          <Button variant="contained" component="label" disabled={isImporting}>
            {isImporting ? 'Đang đọc' : hasFile ? 'Đổi file' : 'Chọn file Excel'}
            <input type="file" style={{ display: 'none' }} accept={sheetJSFT} onChange={handleUploadFileExcel} disabled={isImporting} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SelectExcelButton;
