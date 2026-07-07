import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Hủy',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogId = title.replace(/\s/g, '-').toLowerCase();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={`${dialogId}-description`}
    >
      <DialogTitle id={`${dialogId}-title`}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id={`${dialogId}-description`}>{body}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;