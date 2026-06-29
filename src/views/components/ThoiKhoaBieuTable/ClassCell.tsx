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

const randomColors = [
  '#2563EB',
  '#1D4ED8',
  '#0F766E',
  '#047857',
  '#B45309',
  '#B91C1C',
  '#52525B',
  '#18181B',
] as const;

type Props = {
  data: ClassModel;
  isOutsideTable?: boolean;
} & React.TdHTMLAttributes<HTMLTableCellElement>;

const getMonChonRoiKey = (data: ClassModel) => `${data.MaMH}-${data.ThucHanh}`;
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
  const [isHoveringOnWarningIcon, setIsHoveringOnWarningIcon] = useState(false);
  const { isWarning, getWarningColor } = useMonChonRoi();
  const isHoveringOnThisCell = (data: ClassModel, fieldCompare: keyof ClassModel) => {
    return cellHovering?.[fieldCompare] === data?.[fieldCompare];
  };
  const isHoveringOnThisCellRemoveIcon = (data: ClassModel) =>
    isHoveringOnThisCell(data, 'MaMH') && isHoveringOnRemoveIcon;
  const isHoveringOnThisCellWarningIcon = (data: ClassModel) => {
    return !!cellHovering && getMonChonRoiKey(data) === getMonChonRoiKey(cellHovering) && isHoveringOnWarningIcon;
  };
  const onRemoveClass = () => {
    setCellHovering(null);
    setIsHoveringOnRemoveIcon(false);
    setIsHoveringOnWarningIcon(false);
  };
  return {
    isHoveringOnThisCell,
    isHoveringOnThisCellRemoveIcon,
    isHoveringOnThisCellWarningIcon,
    setCellHovering,
    setIsHoveringOnRemoveIcon,
    setIsHoveringOnWarningIcon,
    isWarning,
    getWarningColor,
    onRemoveClass,
  };
});

function ClassCell({ data, isOutsideTable = false, ...restProps }: Props) {
  const { MaLop, NgonNgu, TenMH, TenGV, PhongHoc, NBD, NKT, Thu, Tiet } = data;
  const removeClasses = useTkbStore((s) => s.removeClasses);
  const selectedClasses = useTkbStore(selectSelectedClasses);
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const {
    isHoveringOnThisCell,
    isHoveringOnThisCellRemoveIcon,
    isHoveringOnThisCellWarningIcon,
    setIsHoveringOnWarningIcon,
    setCellHovering,
    setIsHoveringOnRemoveIcon,
    isWarning,
    getWarningColor,
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

  return (
    <Tooltip title={isRedundantRelated ? 'Bị trùng TKB' : null}>
      <td
        {...restProps}
        className={clsx('cell-class', {
          'cell-class-hovering': isHoveringOnThisCell(data, 'MaMH'),
        })}
        style={{
          boxShadow: isRedundantRelated ? `inset 0 0 0 3px ${randomColors[redundantIndex]}` : undefined,
        }}
        onMouseEnter={() => setCellHovering(data)}
        onMouseLeave={() => setCellHovering(null)}
      >
        {!isChiVeTkb && (
          <Tooltip
            title={
              <>
                Xoá môn này
                {isWarning(data) && isHoveringOnThisCell(data, 'MaLop') && (
                  <>
                    <br />
                    hoặc Shift+Click để chỉ xoá slot thừa này
                  </>
                )}
              </>
            }
            open={isHoveringOnThisCellRemoveIcon(data)}
          >
            <IconButton
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
              }}
              className="remove-class-btn"
            >
              <DeleteOutlineIcon />
            </IconButton>
          </Tooltip>
        )}
        <strong>
          {MaLop}
          {isWarning(data) && (
            <Tooltip open={isHoveringOnThisCellWarningIcon(data)} title="Có vẻ như bạn đang chọn thừa cho môn này">
              <WarningAmberIcon
                onMouseEnter={() => setIsHoveringOnWarningIcon(true)}
                onMouseLeave={() => setIsHoveringOnWarningIcon(false)}
                style={{ color: getWarningColor(data) }}
              />
            </Tooltip>
          )}{' '}
          - {NgonNgu}
        </strong>
        <br />
        {TenMH}
        <br />
        <strong>{TenGV}</strong>
        <br />
        {PhongHoc}
        <br />
        BĐ: {NBD}
        <br />
        KT: {NKT}
        <br />
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
    </Tooltip>
  );
}

export default ClassCell;
