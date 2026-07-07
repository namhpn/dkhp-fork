import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useExcelImport } from '../1ChonFileExcel/useExcelImport';
import { selectDataExcel, selectHasDestructiveFileState, useTkbStore } from '../../zus';
import ConfirmDialog from './ConfirmDialog';

type PendingAction = 'replace' | 'remove' | null;

const DESTRUCTIVE_BODY =
  'Thao tác này sẽ xóa các lớp đang chọn và kết quả đã ghép từ mã lớp.';

function HeaderFileControl() {
  const dataExcel = useTkbStore(selectDataExcel);
  const hasDestructiveFileState = useTkbStore(selectHasDestructiveFileState);
  const removeFile = useTkbStore((s) => s.removeDataExcel);
  const { isImporting, triggerFileInput, fileInputRef, handleFileChange, sheetJSFT } = useExcelImport();
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);

  const hasFile = !!dataExcel?.data?.length;

  const handleReplaceClick = () => {
    if (hasDestructiveFileState) {
      setPendingAction('replace');
      return;
    }
    triggerFileInput();
  };

  const handleRemoveClick = () => {
    if (hasDestructiveFileState) {
      setPendingAction('remove');
      return;
    }
    removeFile();
  };

  const handleConfirm = () => {
    if (pendingAction === 'replace') {
      setPendingAction(null);
      triggerFileInput();
      return;
    }
    if (pendingAction === 'remove') {
      setPendingAction(null);
      removeFile();
    }
  };

  const handleCancel = () => {
    setPendingAction(null);
  };

  return (
    <div className="header-file-control" aria-busy={isImporting}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept={sheetJSFT}
        onChange={handleFileChange}
        disabled={isImporting}
      />

      {isImporting ? (
        <Button variant="outlined" disabled startIcon={<CircularProgress size={14} color="inherit" />}>
          Đang đọc file…
        </Button>
      ) : !hasFile ? (
        <Button variant="contained" onClick={triggerFileInput}>
          Tải file thời khóa biểu (.xlsx)
        </Button>
      ) : (
        <div className="header-file-control-loaded">
          <Typography
            className="header-file-control-filename"
            noWrap
            title={dataExcel?.fileName}
            component="span"
          >
            {dataExcel?.fileName}
          </Typography>
          <Button variant="outlined" size="small" onClick={handleReplaceClick}>
            Đổi file
          </Button>
          <IconButton size="small" aria-label="Gỡ file" onClick={handleRemoveClick}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      )}

      <ConfirmDialog
        open={pendingAction === 'replace'}
        title="Đổi file?"
        body={DESTRUCTIVE_BODY}
        confirmLabel="Đổi file"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ConfirmDialog
        open={pendingAction === 'remove'}
        title="Gỡ file?"
        body={DESTRUCTIVE_BODY}
        confirmLabel="Gỡ file"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default HeaderFileControl;