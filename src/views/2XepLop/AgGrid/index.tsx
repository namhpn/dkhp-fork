import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClassModel } from 'types';
import { getAgGridRowId } from '../../../utils';
import { useTrungTkbDialogContext } from '../TrungTkbDialog';
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
    onRowClicked,
    rowData,
    getRowId,
  } = useGridOptions();

  const { conflictRowIds } = useTrungTkbDialogContext();

  // Apply conflict-flash class to rows matching conflict IDs
  const rowClassRules = React.useMemo(() => {
    const idSet = new Set(conflictRowIds);
    return {
      'conflict-flash': (params: any) => {
        return params.data ? idSet.has(getAgGridRowId(params.data)) : false;
      },
    };
  }, [conflictRowIds]);

  return (
    <>
      <div className="ag-theme-alpine course-grid">
        <AgGridReact<ClassModel>
          ref={agGridRef}
          rowData={rowData}
          isRowSelectable={isRowSelectable}
          defaultColDef={defaultColDef}
          columnDefs={columnDefs}
          autoGroupColumnDef={autoGroupColumnDef}
          headerHeight={42}
          rowHeight={34}
          enableCellTextSelection={true}
          suppressAnimationFrame={true}
          rowSelection="multiple"
          rowMultiSelectWithClick={true}
          groupSelectsChildren={true}
          groupSelectsFiltered={true}
          getMainMenuItems={getMainMenuItems}
          getContextMenuItems={getContextMenuItems}
          rowGroupPanelShow="never"
          suppressDragLeaveHidesColumns={true}
          rowClass="ag-cell-normal"
          rowClassRules={rowClassRules}
          onColumnVisible={onColumnChanged}
          onColumnPinned={onColumnChanged}
          onColumnResized={onColumnChanged}
          onColumnMoved={onColumnChanged}
          onColumnRowGroupChanged={onColumnChanged}
          onFilterChanged={onFilterChanged}
          onSelectionChanged={onSelectionChanged}
          onGridReady={onGridReady}
          getRowId={getRowId}
          onRowClicked={onRowClicked}
        />
      </div>
    </>
  );
}

export default AgGrid;
