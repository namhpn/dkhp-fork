import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { closeSnackbar, enqueueSnackbar } from 'notistack';
import React, { ChangeEventHandler } from 'react';
import XLSX from 'xlsx';
import { selectDataExcel, useTkbStore } from '../../zus';
import { arrayToTkbObject, getLastUpdateString, sheetJSFT, toDateTimeString } from './utils';

const Bold = ({ children }) => <b style={{ marginLeft: 5 }}>{children}</b>;

function SelectExcelButton() {
  const dataExcel = useTkbStore(selectDataExcel);
  const setDataExcel = useTkbStore((s) => s.setDataExcel);
  const lastUpdateString = getLastUpdateString(dataExcel);
  const hasFile = !!lastUpdateString;

  const handleUploadFileExcel = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;
      reader.onload = (e) => {
        const bstr = e?.target?.result;
        const wb = XLSX.read(bstr, { type: rABS ? 'binary' : 'array' });
        const wsLyThuyet = wb.Sheets[wb.SheetNames[0]];
        const wsThucHanh = wb.Sheets[wb.SheetNames[1]];
        const dataLyThuyet = XLSX.utils.sheet_to_json<any[][]>(wsLyThuyet, { header: 1 });
        const dataThucHanh = XLSX.utils.sheet_to_json<any[][]>(wsThucHanh, { header: 1 });
        const dataInArray = [...dataLyThuyet, ...dataThucHanh].filter(
          (row) => typeof row[0] === 'number',
        );
        if (dataInArray.length) {
          const now = new Date();
          setDataExcel({
            data: dataInArray.map((array) => arrayToTkbObject(array)),
            fileName: file.name,
            lastUpdateTimestamp: now.getTime(),
            lastUpdate: toDateTimeString(now),
          });
          enqueueSnackbar(
            <>
              Đã đọc thành công <Bold>{file.name}</Bold>
            </>,
            {
              variant: 'success',
              action: (key) => (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    closeSnackbar(key);
                  }}
                >
                  Đã hiểu
                </Button>
              ),
            },
          );
        } else {
          enqueueSnackbar('File chưa đúng định dạng thời khóa biểu của trường', {
            variant: 'error',
          });
        }
      };
      if (rABS) reader.readAsBinaryString(file);
      else reader.readAsArrayBuffer(file);
      event.target.value = '';
    },
    [setDataExcel],
  );

  return (
    <div className="upload-zone">
      <div className="upload-drop-panel">
        <div>
          <div className="upload-icon-box" aria-hidden="true">
            <FileUploadOutlinedIcon />
          </div>
          <Typography component="h2" className="upload-title">
            Nạp file Excel thời khóa biểu của UIT
          </Typography>
          <Typography className="upload-text">
            File được đọc trực tiếp trong trình duyệt. Dữ liệu môn học và lớp đã chọn chỉ được lưu ở bộ nhớ trình duyệt
            để bạn có thể quay lại giữa các bước.
          </Typography>
        </div>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }} mt={3}>
          <Tooltip title={dataExcel?.fileName || 'Chưa upload file'}>
            <Button
              variant="contained"
              color={hasFile ? 'success' : 'primary'}
              component="label"
              startIcon={<FileUploadOutlinedIcon />}
              size="large"
            >
              {hasFile ? 'Thay file Excel' : 'Chọn file Excel'}
              <input type="file" style={{ display: 'none' }} accept={sheetJSFT} onChange={handleUploadFileExcel} />
            </Button>
          </Tooltip>
          {hasFile && <Chip color="success" variant="outlined" label={`Cập nhật: ${lastUpdateString}`} />}
        </Stack>
      </div>

      <div className="upload-meta-list">
        <div className="meta-row">
          <Typography className="meta-label">Trạng thái</Typography>
          <Typography className="meta-value">{hasFile ? 'Sẵn sàng xếp lớp' : 'Chưa có dữ liệu'}</Typography>
        </div>
        <div className="meta-row">
          <Typography className="meta-label">File hiện tại</Typography>
          <Typography className="meta-value">{dataExcel?.fileName || 'Chưa chọn file'}</Typography>
        </div>
        <div className="meta-row">
          <Typography className="meta-label">Số dòng đọc được</Typography>
          <Typography className="meta-value">{dataExcel?.data?.length ?? 0} lớp / lịch học</Typography>
        </div>
        <div className="meta-row">
          <Typography className="meta-label">File mẫu</Typography>
          <Typography className="meta-value">
            <InsertDriveFileOutlinedIcon style={{ width: 16, height: 16, verticalAlign: 'text-bottom' }} />{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://docs.google.com/spreadsheets/d/e/2PACX-1vRyf8-kMRTo4CllfPA4sjbjxkhGhR1tT7yD1HASjmClqTwwkJBgWRvuxJPIAK8Wdw/pub?output=xlsx"
            >
              TKB dự kiến HK2 2023-2024
            </a>
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default SelectExcelButton;
