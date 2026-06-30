import clsx from 'clsx';
import React, { useMemo } from 'react';
import { getDanhSachTiet } from '../../../utils';
import ErrorBoundary from '../ErrorBoundary';
import ClassCell, { ClassCellContext } from './ClassCell';
import TableHead from './TableHead';
import {
  CELL,
  PhanLoaiHocTrenTruongContext,
  type RowData,
  usePhanLoaiHocTrenTruongContext,
  useProcessImageTkb,
} from './hooks';
import './styles.css';
import { timeLookup, tietOnline } from './utils';

export interface TkbTableHandle {
  saveTkbImage: () => void;
  copyTkbImage: () => void;
}

const GetCell = ({ data }: any) => {
  if (data === CELL.NO_CLASS) return <td />;
  if (data === CELL.OCCUPIED) return null;
  return <ClassCell data={data} rowSpan={getDanhSachTiet(data.Tiet).length} />;
};

function RowHocTrenTruong({ row, index }: { row: RowData; index: number }) {
  const shouldBeHidden = useMemo(() => {
    if (index < 10) return false;
    return Object.values(row).every((cell) => cell === CELL.NO_CLASS);
  }, [row, index]);

  return (
    <tr style={{ visibility: shouldBeHidden ? 'collapse' : undefined }}>
      <td className="cell-tiet">
        Tiết {index === tietOnline.index ? tietOnline.stringValue : index + 1} <br />
        {timeLookup[index]}
      </td>
      {[2, 3, 4, 5, 6, 7].map((t) => (
        <GetCell key={t} data={row['Thu' + t]} />
      ))}
    </tr>
  );
}

const Render = React.forwardRef<TkbTableHandle, {}>((_props, ref) => {
  const { rowDataHocTrenTruong, khongHocTrenTruong, redundant } = usePhanLoaiHocTrenTruongContext();

  const { tkbTableRef, saveTkbImageToComputer, copyTkbImageToClipboard } = useProcessImageTkb();

  React.useImperativeHandle(ref, () => ({
    saveTkbImage: saveTkbImageToComputer,
    copyTkbImage: copyTkbImageToClipboard,
  }));

  return (
    <ClassCellContext>
      <div id="thoi-khoa-bieu" className={clsx({ compact: false })}>
        <div style={{ display: 'flex' }}>
          {redundant
            .flatMap((it) => it.new)
            .map((lop, index) => (
              <tr key={index}>
                <ClassCell data={lop} isOutsideTable />
              </tr>
            ))}
        </div>
        <table ref={tkbTableRef}>
          <TableHead />
          <tbody>
            {rowDataHocTrenTruong.map((row, index) => (
              <RowHocTrenTruong key={index} row={row} index={index} />
            ))}
            {khongHocTrenTruong.map((lop, index) => (
              <tr key={index}>
                <ClassCell colSpan={7} data={lop} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ClassCellContext>
  );
});

const Index = React.forwardRef<TkbTableHandle, {}>((_props, ref) => {
  return (
    <ErrorBoundary>
      <ClassCellContext>
        <PhanLoaiHocTrenTruongContext>
          <Render ref={ref} />
        </PhanLoaiHocTrenTruongContext>
      </ClassCellContext>
    </ErrorBoundary>
  );
});

export default Index;
