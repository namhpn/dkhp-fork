import Tooltip from '@mui/material/Tooltip';
import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import { ClassModel } from 'types';

export type GridSelectionContext = {
  isRowSelected: (data: ClassModel) => boolean;
  getConflictMaLop: (data: ClassModel) => string | null;
  onToggleRowSelection: (data: ClassModel) => void;
};

function SelectedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9" fill="currentColor" />
      <path d="M6 10.2L8.6 12.8L14 7.4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UnselectedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5V13.5M6.5 10H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DisabledIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <path d="M6.8 6.8L13.2 13.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}

function SelectionToggleCell(params: ICellRendererParams<ClassModel, unknown, GridSelectionContext>) {
  const data = params.data;
  if (!data) return null;

  const { isRowSelected, getConflictMaLop, onToggleRowSelection } = params.context;
  const selected = isRowSelected(data);
  const conflictMaLop = getConflictMaLop(data);
  const disabled = !selected && !!conflictMaLop;

  const label = selected
    ? `Bỏ chọn ${data.MaLop}`
    : disabled
      ? `Không thể chọn ${data.MaLop}: trùng ${conflictMaLop}`
      : `Chọn ${data.MaLop}`;

  const button = (
    <button
      type="button"
      className={`grid-selection-toggle${selected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}
      aria-label={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onToggleRowSelection(data);
      }}
    >
      <span className="grid-selection-toggle-icon" aria-hidden="true">
        {selected ? <SelectedIcon /> : disabled ? <DisabledIcon /> : <UnselectedIcon />}
      </span>
    </button>
  );

  if (disabled) {
    return (
      <Tooltip title={`Trùng ${conflictMaLop}`} describeChild>
        <span className="grid-selection-toggle-wrap">{button}</span>
      </Tooltip>
    );
  }

  return button;
}

SelectionToggleCell.refresh = () => true;

export default SelectionToggleCell;
