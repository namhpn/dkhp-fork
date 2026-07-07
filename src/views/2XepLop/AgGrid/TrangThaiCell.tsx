import { ICellRendererParams } from 'ag-grid-community';
import React from 'react';
import { ClassModel } from 'types';
import { GridSelectionContext } from './SelectionToggleCell';

export type TrangThaiValueInput = {
  data?: ClassModel;
  context?: unknown;
};

export const getTrangThaiCellValue = ({ data, context }: TrangThaiValueInput): string => {
  if (!data) return '';
  const gridContext = context as GridSelectionContext;
  if (gridContext.isRowSelected(data)) return 'Đã chọn';
  const conflictMaLop = gridContext.getConflictMaLop(data);
  if (conflictMaLop) return `Trùng ${conflictMaLop}`;
  return '';
};

function TrangThaiCell(params: ICellRendererParams<ClassModel, unknown, GridSelectionContext>) {
  const data = params.data;
  if (!data) return null;

  const label = getTrangThaiCellValue({ data, context: params.context });
  if (!label) return null;

  return (
    <span className="trang-thai-cell-text" title={label} aria-label={label}>
      {label}
    </span>
  );
}

TrangThaiCell.refresh = () => true;

export default TrangThaiCell;