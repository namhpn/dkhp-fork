import React, { useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, LicenseManager, RowGroupingModule } from 'ag-grid-enterprise';
import { ClassModel } from 'types';

import 'ag-grid-enterprise/styles/ag-grid.css';
import 'ag-grid-enterprise/styles/ag-theme-alpine.css';
import './styles.css';
import { useGridOptions } from './utils';

// ag-grid lives entirely in this lazy chunk: registering here (module scope) keeps the
// enterprise anchor out of the entry chunk — the grid is unreachable until an Excel
// import sets dataExcel. Register only the features in use — RowGrouping (multi-token
// search), ContextMenu and the ColumnMenu (header menu) pull their internal
// dependencies via ModuleRegistry; everything else (charts, Excel export, set filter,
// side bars, …) stays tree-shaken out. setupTests.ts mirrors this for tests.
ModuleRegistry.registerModules([AllCommunityModule, ColumnMenuModule, ContextMenuModule, RowGroupingModule]);
LicenseManager.setLicenseKey('I_<3_SCHOOL_NDEwMjMzMzIwMDAwMA==afc05c982fa05a2578eb9cab60c42d78');

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

  // Stable object identity forever — ag-grid re-processes selection options (and
  // re-renders rows) whenever the rowSelection object changes, which breaks cell
  // interactions mid-click and triggers flushSync warnings. Fresh selectability is
  // delivered through the ref; the utils effect keeps node.selectable in sync.
  // checkboxes/headerCheckbox stay off: the pinned "action" toggle is the app's
  // selection UI; the v32.2+ object API would otherwise add a default selection column.
  const isRowSelectableRef = useRef(isRowSelectable);
  isRowSelectableRef.current = isRowSelectable;
  const rowSelection = useMemo(
    () => ({
      mode: 'multiRow' as const,
      enableClickSelection: false,
      groupSelects: 'filteredDescendants' as const,
      checkboxes: false,
      headerCheckbox: false,
      isRowSelectable: (node) => isRowSelectableRef.current(node),
    }),
    [],
  );

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
          theme="legacy"
          rowSelection={rowSelection}
          defaultColDef={defaultColDef}
          columnDefs={columnDefs}
          autoGroupColumnDef={autoGroupColumnDef}
          headerHeight={42}
          rowHeight={34}
          enableCellTextSelection={true}
          suppressAnimationFrame={true}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          getMainMenuItems={getMainMenuItems}
          getContextMenuItems={getContextMenuItems}
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
