import clsx from 'clsx';
import React, { useMemo } from 'react';
import { ClassModel } from '../../../types';
import { getDanhSachTiet } from '../../../utils';
import ErrorBoundary from '../ErrorBoundary';
import ClassCell, { ClassCellContext } from './ClassCell';
import TableHead from './TableHead';
import {
  CELL,
  getVisibleRowCount,
  PhanLoaiHocTrenTruongContext,
  type RowData,
  usePhanLoaiHocTrenTruongContext,
  useProcessImageTkb,
} from './hooks';
import './styles.css';
import { TKB_EXPORT_TIET_COL_PX, TKB_EXPORT_WIDTH_PX, timeLookup, tietOnline } from './utils';

export interface TkbTableHandle {
  saveTkbImage: () => void;
}

export interface TkbTableProps {
  /** Sidebar / side-panel density; applies `#thoi-khoa-bieu.compact` styles. */
  compact?: boolean;
}

const GetCell = ({ data, forExport }: { data: any; forExport?: boolean }) => {
  if (data === CELL.NO_CLASS) return <td />;
  if (data === CELL.OCCUPIED) return null;
  return <ClassCell data={data} rowSpan={getDanhSachTiet(data.Tiet).length} forExport={forExport} />;
};

function RowHocTrenTruong({ row, index, forExport }: { row: RowData; index: number; forExport?: boolean }) {
  return (
    <tr>
      <td className="cell-tiet">
        Tiết {index === tietOnline.index ? tietOnline.stringValue : index + 1} <br />
        {timeLookup[index]}
      </td>
      {[2, 3, 4, 5, 6, 7].map((t) => (
        <GetCell key={t} data={row['Thu' + t]} forExport={forExport} />
      ))}
    </tr>
  );
}

function TkbTableBody({
  rows,
  khongHocTrenTruong,
  forExport = false,
}: {
  rows: RowData[];
  khongHocTrenTruong: ClassModel[];
  forExport?: boolean;
}) {
  return (
    <>
      <TableHead />
      <tbody>
        {rows.map((row, index) => (
          <RowHocTrenTruong key={index} row={row} index={index} forExport={forExport} />
        ))}
        {khongHocTrenTruong.map((lop, index) => (
          <tr key={index}>
            <ClassCell colSpan={7} data={lop} forExport={forExport} />
          </tr>
        ))}
      </tbody>
    </>
  );
}

const Render = React.forwardRef<TkbTableHandle, TkbTableProps>(({ compact = false }, ref) => {
  const { rowDataHocTrenTruong, khongHocTrenTruong, redundant } = usePhanLoaiHocTrenTruongContext();

  const { tkbTableRef, saveTkbImageToComputer } = useProcessImageTkb();

  const visibleRows = useMemo(
    () => rowDataHocTrenTruong.slice(0, getVisibleRowCount(rowDataHocTrenTruong)),
    [rowDataHocTrenTruong],
  );

  React.useImperativeHandle(ref, () => ({
    saveTkbImage: saveTkbImageToComputer,
  }));

  return (
    <ClassCellContext>
      <>
        <div id="thoi-khoa-bieu" className={clsx({ compact })}>
          <div style={{ display: 'flex' }}>
            {redundant
              .flatMap((it) => it.new)
              .map((lop, index) => (
                <tr key={index}>
                  <ClassCell data={lop} isOutsideTable />
                </tr>
              ))}
          </div>
          <table>
            <TkbTableBody rows={visibleRows} khongHocTrenTruong={khongHocTrenTruong} />
          </table>
        </div>
        <div className="tkb-export-source" aria-hidden="true">
          <div id="thoi-khoa-bieu-export" ref={tkbTableRef}>
            <table>
              <colgroup>
                <col style={{ width: TKB_EXPORT_TIET_COL_PX }} />
                {Array.from({ length: 6 }, (_, index) => (
                  <col
                    key={index}
                    style={{
                      width: (TKB_EXPORT_WIDTH_PX - TKB_EXPORT_TIET_COL_PX) / 6,
                    }}
                  />
                ))}
              </colgroup>
              <TkbTableBody rows={visibleRows} khongHocTrenTruong={khongHocTrenTruong} forExport />
            </table>
          </div>
        </div>
      </>
    </ClassCellContext>
  );
});

const Index = React.forwardRef<TkbTableHandle, TkbTableProps>(({ compact = false }, ref) => {
  return (
    <ErrorBoundary>
      <ClassCellContext>
        <PhanLoaiHocTrenTruongContext>
          <Render ref={ref} compact={compact} />
        </PhanLoaiHocTrenTruongContext>
      </ClassCellContext>
    </ErrorBoundary>
  );
});

export default Index;
