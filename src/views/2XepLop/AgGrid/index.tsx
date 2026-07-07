import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClassModel } from 'types';
import './styles.css';
import { useGridOptions } from './utils';

function AgGrid() {
  const {
    agGridRef,
    isRowSelectable,
    columnDefs,
    defaultColDef,
    autoGroupColumnDef,
    getMainMenuItems,
    getContextMenuItems,
    onSelectionChanged,
    onFilterChanged,
    onColumnChanged,
    onGridReady,
    onFirstDataRendered,
    onRowClicked,
    rowData,
    getRowId,
    gridContext,
    quickFilterText,
    onQuickFilterChange,
    visibleCount,
    totalCount,
    hasNoVisibleRows,
  } = useGridOptions();

  return (
    <div className="grid-with-toolbar">
      <div className="grid-toolbar">
        <input
          type="search"
          className="grid-search-input"
          value={quickFilterText}
          onChange={(event) => onQuickFilterChange(event.target.value)}
          placeholder="Tìm lớp, môn học, giảng viên…"
          aria-label="Tìm lớp, môn học, giảng viên"
        />
        <span className="grid-result-summary" aria-live="polite">
          {visibleCount} / {totalCount} lớp
        </span>
      </div>

      {hasNoVisibleRows ? (
        <div className="grid-empty-filter" role="status">
          Không có lớp phù hợp
        </div>
      ) : null}

      <div className="ag-theme-alpine course-grid">
        <AgGridReact<ClassModel>
          ref={agGridRef}
          rowData={rowData}
          context={gridContext}
          isRowSelectable={isRowSelectable}
          defaultColDef={defaultColDef}
          columnDefs={columnDefs}
          autoGroupColumnDef={autoGroupColumnDef}
          headerHeight={42}
          rowHeight={34}
          enableCellTextSelection={true}
          suppressAnimationFrame={true}
          suppressRowClickSelection={true}
          rowSelection="multiple"
          groupSelectsChildren={true}
          groupSelectsFiltered={true}
          getMainMenuItems={getMainMenuItems}
          getContextMenuItems={getContextMenuItems}
          rowGroupPanelShow="never"
          suppressDragLeaveHidesColumns={true}
          rowClass="ag-cell-normal"
          onColumnVisible={onColumnChanged}
          onColumnPinned={onColumnChanged}
          onColumnResized={onColumnChanged}
          onColumnMoved={onColumnChanged}
          onColumnRowGroupChanged={onColumnChanged}
          onFilterChanged={onFilterChanged}
          onSelectionChanged={onSelectionChanged}
          onGridReady={onGridReady}
          onFirstDataRendered={onFirstDataRendered}
          getRowId={getRowId}
          onRowClicked={onRowClicked}
        />
      </div>
    </div>
  );
}

export default AgGrid;