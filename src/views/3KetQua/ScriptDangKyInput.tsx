import { useTheme } from '@mui/material';
import type { Theme } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useEffect, useMemo } from 'react';
import { extractListMaLop } from '../../utils';
import {
  getUrlResolvedMaLop,
  selectIsChiVeTkb,
  selectManualParseErrorMessages,
  selectPhanLoaiHocTrenTruong,
  selectTextareaChiVeTkb,
  useTkbStore,
} from '../../zus';

const getReadonlySx = (theme: Theme) => ({
  '& .MuiInputBase-input': {
    color: theme.palette.text.secondary,
    backgroundColor: 'var(--surface-muted, var(--surface-muted-fallback))',
    cursor: 'default',
  },
});

const MANUAL_PLACEHOLDER = 'VD: EC201, IT003\nHoặc mỗi mã một dòng';

const useCommon = () => {
  const cacLop = useTkbStore(selectPhanLoaiHocTrenTruong);
  const listMaLop = useMemo(() => extractListMaLop(cacLop.flat()), [cacLop]);
  const hasLop = listMaLop.length > 0;

  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const textareaChiVeTkb = useTkbStore(selectTextareaChiVeTkb);

  const dsLopInputValue = (() => {
    if (isChiVeTkb) {
      return textareaChiVeTkb || '';
    }
    if (!hasLop) return 'Chưa có lớp nào';
    return listMaLop.join(',');
  })();

  return {
    hasLop,
    isChiVeTkb,
    dsLopInputValue,
  };
};

export function DanhSachLopInput() {
  const theme = useTheme();
  const setTextareChiVeTkb = useTkbStore((s) => s.setTextareChiVeTkb);
  const parseErrorMessages = useTkbStore(selectManualParseErrorMessages);
  const setManualResolvedMaLop = useTkbStore((s) => s.setManualResolvedMaLop);
  const { hasLop, dsLopInputValue, isChiVeTkb } = useCommon();
  const useToolXepLop = !isChiVeTkb;
  const hasErrors = isChiVeTkb && parseErrorMessages.length > 0;

  useEffect(() => {
    const urlCodes = getUrlResolvedMaLop();
    if (urlCodes && urlCodes.length > 0) {
      setTextareChiVeTkb(urlCodes.join(', '));
      setManualResolvedMaLop(urlCodes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="field-with-action">
      <div className="field-label-row">
        <label className="field-label" htmlFor="manual-class-input">
          Nhập mã môn hoặc mã lớp
        </label>
      </div>
      <TextField
        id="manual-class-input"
        error={hasErrors}
        fullWidth
        multiline
        placeholder={isChiVeTkb ? MANUAL_PLACEHOLDER : undefined}
        inputProps={{
          readOnly: useToolXepLop,
          style: { resize: 'vertical', minHeight: 92 },
        }}
        minRows={4}
        maxRows={10}
        onChange={(e) => {
          setTextareChiVeTkb(e.target.value);
        }}
        value={dsLopInputValue}
        disabled={useToolXepLop && !hasLop}
        helperText={
          hasErrors ? (
            <span>{parseErrorMessages.join('; ')}</span>
          ) : (
            <span>&nbsp;</span>
          )
        }
        FormHelperTextProps={{
          sx: {
            marginLeft: 0,
            fontWeight: 600,
            fontSize: '0.8rem',
            lineHeight: 1.4,
            color: hasErrors ? 'var(--error, #B91C1C)' : 'transparent',
          },
        }}
        sx={
          isChiVeTkb && !hasErrors
            ? {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--blue, #2563EB)',
                },
              }
            : isChiVeTkb && hasErrors
            ? {}
            : getReadonlySx(theme)
        }
      />
    </div>
  );
}

export default DanhSachLopInput;