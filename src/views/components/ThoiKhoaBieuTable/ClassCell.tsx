import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IconButton, Tooltip } from '@mui/material';
import clsx from 'clsx';
import constate from 'constate';
import groupBy from 'lodash/groupBy';
import reverse from 'lodash/reverse';
import { useMemo, useState } from 'react';
import { ClassModel } from '../../../types';
import { isSameAgGridRowId, uniqMaLop } from '../../../utils';
import { selectIsChiVeTkb, selectSelectedClasses, selectSelectedClassesOutput, useTkbStore } from '../../../zus';
import { usePhanLoaiHocTrenTruongContext } from './hooks';
import './styles.css';

const randomColors = ['#2563EB', '#1D4ED8', '#0F766E', '#047857', '#B45309', '#B91C1C', '#52525B', '#18181B'] as const;

type Props = {
  data: ClassModel;
  isOutsideTable?: boolean;
  /** Static clone for html2canvas export — no tooltips or shared hover state. */
  forExport?: boolean;
} & React.TdHTMLAttributes<HTMLTableCellElement>;

const getMonChonRoiKey = (data: ClassModel) => `${data.MaMH}-${data.ThucHanh}`;
/** Files without NBD/NKT columns yield 'NaN-NaN-NaN' — treat that as missing (legacy persisted imports stored it verbatim). */
const isMissingNgay = (value: string | undefined | null) =>
  value == null || String(value).trim() === '' || String(value).includes('NaN');
const useMonChonRoi = () => {
  const newRandomColors = useMemo(() => reverse([...randomColors]), []);
  const selectedClasses = useTkbStore(selectSelectedClassesOutput);
  const map = groupBy(selectedClasses, getMonChonRoiKey);
  const mapColor: Record<keyof typeof map, (typeof newRandomColors)[number]> = {};
  let index = 0;
  Object.entries(map).forEach(([key, value]) => {
    const hasDuplication = uniqMaLop(value).length > 1;
    if (hasDuplication) mapColor[key] = newRandomColors[index++];
  });

  const getWarningColor = (data: ClassModel) => mapColor[getMonChonRoiKey(data)];
  const isWarning = (data: ClassModel) => !!getWarningColor(data);
  return { isWarning, getWarningColor };
};
export const [ClassCellContext, useClassCellContext] = constate(() => {
  const [cellHovering, setCellHovering] = useState<ClassModel | null>(null);
  const [isHoveringOnRemoveIcon, setIsHoveringOnRemoveIcon] = useState(false);
  const { isWarning, getWarningColor } = useMonChonRoi();
  const isHoveringOnThisCell = (data: ClassModel, fieldCompare: keyof ClassModel) => {
    return cellHovering?.[fieldCompare] === data?.[fieldCompare];
  };
  const isHoveringOnThisCellRemoveIcon = (data: ClassModel) =>
    isHoveringOnThisCell(data, 'MaMH') && isHoveringOnRemoveIcon;
  const onRemoveClass = () => {
    setCellHovering(null);
    setIsHoveringOnRemoveIcon(false);
  };
  return {
    isHoveringOnThisCell,
    isHoveringOnThisCellRemoveIcon,
    setCellHovering,
    setIsHoveringOnRemoveIcon,
    isWarning,
    getWarningColor,
    onRemoveClass,
  };
});

function ClassCell({ data, isOutsideTable = false, forExport = false, ...restProps }: Props) {
  const { MaLop, TenMH, TenGV, PhongHoc, KhoaHoc, NBD, NKT, Thu, Tiet } = data;
  const ngonNgu = String(data.NgonNgu ?? '').trim();
  const removeClasses = useTkbStore((s) => s.removeClasses);
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const {
    isHoveringOnThisCell,
    isHoveringOnThisCellRemoveIcon,
    setCellHovering,
    setIsHoveringOnRemoveIcon,
    isWarning,
    onRemoveClass,
  } = useClassCellContext();

  const { redundant } = usePhanLoaiHocTrenTruongContext();

  // TODO: display warning cho cac truong hop:
  // - chon 2 slot chung mon khac lop, i.e: Nhap Mon Lap Trinh LT cua 1 nguoi, TH cua 1 nguoi khac
  const cacLopChungMonDangChon = useMemo(() => {
    return selectedClasses.filter((selectedClass) => selectedClass.MaMH === data.MaMH);
  }, [data.MaMH, selectedClasses]);

  const redundantIndex = redundant.findIndex((info) => {
    return (
      isSameAgGridRowId(info.existing, data) || info.new.some((addingClass) => isSameAgGridRowId(addingClass, data))
    );
  });
  const isRedundantRelated = redundantIndex > -1;
  const hasNbd = !isMissingNgay(NBD);
  const hasNkt = !isMissingNgay(NKT);
  const detailTooltipText = [
    ...(isRedundantRelated ? ['Bị trùng TKB'] : []),
    ...(hasNbd ? [`BĐ: ${NBD}`] : []),
    ...(hasNkt ? [`KT: ${NKT}`] : []),
  ].join('\n');

  const warningBorder = isWarning(data) ? 'inset 0 0 0 2px var(--warning, var(--warning-fallback))' : null;
  const redundantBorder = isRedundantRelated ? `inset 0 0 0 3px ${randomColors[redundantIndex]}` : null;
  const cellBorder = [warningBorder, redundantBorder].filter(Boolean).join(', ') || undefined;

  const cell = (
    <td
      {...restProps}
      className={clsx('cell-class', {
        'cell-class-hovering': !forExport && isHoveringOnThisCell(data, 'MaMH'),
      })}
      style={{
        boxShadow: cellBorder,
        backgroundColor: isWarning(data) ? 'var(--warning-soft, var(--warning-soft-fallback))' : undefined,
      }}
      onMouseEnter={forExport ? undefined : () => setCellHovering(data)}
      onMouseLeave={forExport ? undefined : () => setCellHovering(null)}
    >
      {!isChiVeTkb && !forExport && (
        <Tooltip
          title={
            <span style={{ whiteSpace: 'pre-line' }}>
              {'Xoá môn này'}
              {isWarning(data) && (
                <>
                  {'\nShift+Click: chỉ xoá ô thừa này'}
                </>
              )}
              {'\nCtrl/Cmd+Shift+Click: xoá tất cả lớp đã chọn'}
            </span>
          }
          open={isHoveringOnThisCellRemoveIcon(data)}
        >
          <IconButton
            aria-label={`Xóa ${MaLop}`}
            onMouseEnter={() => setIsHoveringOnRemoveIcon(true)}
            onMouseLeave={() => setIsHoveringOnRemoveIcon(false)}
            style={{ position: 'absolute', top: 0, right: 0 }}
            color="inherit"
            size="small"
            onClick={(e) => {
              const classesToRemove = (() => {
                if (isWarning(data) && e.shiftKey) {
                  return [data];
                }
                if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
                  // easter eggs: Cmd + Shift + Click to remove all selected classes
                  return selectedClasses;
                }
                return cacLopChungMonDangChon;
              })();
              removeClasses(classesToRemove);
              onRemoveClass();

              requestAnimationFrame(() => {
                const actionBtn = document.querySelector<HTMLButtonElement>(
                  '.timetable-panel-actions button:not([disabled])',
                );
                const mainWorkspace = document.getElementById('main-workspace');
                (actionBtn ?? mainWorkspace)?.focus();
              });
            }}
            className="remove-class-btn"
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Tooltip>
      )}
      {isWarning(data) && <WarningAmberIcon className="cell-class-warning-icon" aria-hidden />}
      <strong>
        {MaLop}
        {ngonNgu ? ` - ${ngonNgu}` : ''}
      </strong>
      <br />
      {TenMH}
      <br />
      <strong>{TenGV}</strong>
      <br />
      {PhongHoc}
      {String(KhoaHoc ?? '').trim() !== '' && (
        <>
          <br />
          <span className="cell-class-khoahoc">Khoá {KhoaHoc}</span>
        </>
      )}
      <br />
      {forExport && hasNbd && (
        <>
          BĐ: {NBD}
          <br />
        </>
      )}
      {forExport && hasNkt && (
        <>
          KT: {NKT}
          <br />
        </>
      )}
      {isOutsideTable && (
        <>
          <br />
          <strong>
            Thứ {Thu} Tiết {Tiet}
          </strong>
          <br />
        </>
      )}
    </td>
  );

  if (forExport || detailTooltipText === '') {
    return cell;
  }

  return (
    <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{detailTooltipText}</span>}>{cell}</Tooltip>
  );
}

export default ClassCell;
