import React, { useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClassModel } from 'types';
import './styles.css';
import { useGridOptions } from './utils';

const SEARCH_PLACEHOLDER = 'Tìm theo lớp, môn, GV… (phân cách bằng ;)';

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
    onCellKeyDown,
    rowData,
    getRowId,
    gridContext,
    quickFilterText,
    onQuickFilterChange,
    visibleCount,
    totalCount,
    hasNoVisibleRows,
    isExternalFilterPresent,
    doesExternalFilterPass,
  } = useGridOptions();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere outside a text field
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      event.preventDefault();
      searchInputRef.current?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="grid-with-toolbar">
      <div className="grid-toolbar">
        <div className="grid-search-wrap">
          <input
            ref={searchInputRef}
            type="search"
            className="grid-search-input"
            value={quickFilterText}
            onChange={(event) => onQuickFilterChange(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            aria-label={SEARCH_PLACEHOLDER}
            title={SEARCH_PLACEHOLDER}
          />
          <span className="grid-search-kbd" aria-hidden="true">
            /
          </span>
        </div>
        <span className="grid-result-summary" aria-live="polite">
          {visibleCount === totalCount
            ? `${totalCount} lớp`
            : `${visibleCount} lớp phù hợp / ${totalCount} lớp`}
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
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
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
          onCellKeyDown={onCellKeyDown}
        />
      </div>
    </div>
  );
}

export default AgGrid;
