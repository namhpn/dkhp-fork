import { AgGridReact } from 'ag-grid-react';
import { ClassModel } from 'types';
import { getTongSoTcJudgement } from '../../../utils';
import { selectSelectedClasses, selectTongSoTcSelected, useTkbStore } from '../../../zus';
import './styles.css';
import { useGridOptions } from './utils';

function GridStatusBar() {
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const tongSoTC = useTkbStore(selectTongSoTcSelected);
  const judgement = getTongSoTcJudgement(tongSoTC);

  return (
    <div className="grid-statusbar" aria-label="Trạng thái xếp lớp">
      <span>
        Lớp đã chọn: <b>{selectedClasses.length}</b>
      </span>
      <span className={judgement.isOk ? 'grid-credit ok' : 'grid-credit warn'}>
        Số tín chỉ: <b>{tongSoTC}</b>
      </span>
    </div>
  );
}

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
      <GridStatusBar />
    </>
  );
}

export default AgGrid;
