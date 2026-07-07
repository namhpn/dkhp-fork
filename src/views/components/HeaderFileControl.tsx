import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useExcelImport } from '../1ChonFileExcel/useExcelImport';
import { selectDataExcel, selectHasDestructiveFileState, useTkbStore } from '../../zus';
import ConfirmDialog from './ConfirmDialog';

type PendingAction = 'remove' | null;

const DESTRUCTIVE_BODY =
  'Thao tác này sẽ xóa các lớp đang chọn và kết quả đã ghép từ mã lớp.';

function HeaderFileControl() {
  const dataExcel = useTkbStore(selectDataExcel);
  const hasDestructiveFileState = useTkbStore(selectHasDestructiveFileState);
  const removeFile = useTkbStore((s) => s.removeDataExcel);
  const { isImporting, triggerFileInput, fileInputRef, handleFileChange, sheetJSFT } = useExcelImport();
  const [pendingAction, setPendingAction] = React.useState<PendingAction>(null);

  const hasFile = !!dataExcel?.data?.length;

  const restoreFocusAfterRemove = () => {
    requestAnimationFrame(() => {
      const uploadBtn = document.querySelector<HTMLButtonElement>(
        '.header-file-control button:not([disabled])',
      );
      const mainWorkspace = document.getElementById('main-workspace');
      (uploadBtn ?? mainWorkspace)?.focus();
    });
  };

  const handleRemoveClick = () => {
    if (hasDestructiveFileState) {
      setPendingAction('remove');
      return;
    }
    removeFile();
    restoreFocusAfterRemove();
  };

  const handleConfirm = () => {
    if (pendingAction === 'remove') {
      setPendingAction(null);
      removeFile();
      restoreFocusAfterRemove();
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
        <Button
          variant="outlined"
          disabled
          aria-busy="true"
          startIcon={<CircularProgress size={14} color="inherit" />}
        >
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
          <IconButton
            className="header-file-remove-btn"
            aria-label="Xóa file"
            onClick={handleRemoveClick}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      )}

      <ConfirmDialog
        open={pendingAction === 'remove'}
        title="Xóa file?"
        body={DESTRUCTIVE_BODY}
        confirmLabel="Xóa file"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default HeaderFileControl;