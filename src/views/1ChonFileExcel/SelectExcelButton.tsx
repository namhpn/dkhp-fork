import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
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
            enqueueSnackbar('File không đúng định dạng thời khóa biểu UIT.', { variant: 'error' });
            return;
          }

          const now = new Date();
          setDataExcel({
            data: dataInArray.map((array) => arrayToTkbObject(array)),
            fileName: file.name,
            lastUpdateTimestamp: now.getTime(),
            lastUpdate: toDateTimeString(now),
          });
          enqueueSnackbar(`Đã import ${file.name}.`, { variant: 'success' });
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
            {isImporting ? <CircularProgress size={20} /> : <FileUploadOutlinedIcon />}
          </div>
          <div style={{ minWidth: 0 }}>
            <Typography component="h3" className="upload-title">
              File Excel thời khóa biểu
            </Typography>
            <Typography className="upload-file-name">{dataExcel?.fileName || 'Chưa chọn file'}</Typography>
          </div>
        </div>

        <div className="upload-actions">
          <Tooltip title={dataExcel?.fileName || 'Chọn file .xlsx'}>
            <span>
              <Button
                variant="contained"
                component="label"
                startIcon={isImporting ? <CircularProgress color="inherit" size={16} /> : <FileUploadOutlinedIcon />}
                disabled={isImporting}
              >
                {isImporting ? 'Đang đọc' : hasFile ? 'Đổi file' : 'Chọn file'}
                <input type="file" style={{ display: 'none' }} accept={sheetJSFT} onChange={handleUploadFileExcel} disabled={isImporting} />
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="outlined"
            href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRyf8-kMRTo4CllfPA4sjbjxkhGhR1tT7yD1HASjmClqTwwkJBgWRvuxJPIAK8Wdw/pub?output=xlsx"
            target="_blank"
            rel="noreferrer"
          >
            File mẫu
          </Button>
        </div>
      </div>

      <div className="upload-meta-list" aria-label="Thông tin file">
        <div className="meta-row">
          <span className="meta-label">Dòng</span>
          <span className="meta-value">{dataExcel?.data?.length ?? 0}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Cập nhật</span>
          <span className="meta-value">{lastUpdateString || '—'}</span>
        </div>
      </div>
    </div>
  );
}

export default SelectExcelButton;
