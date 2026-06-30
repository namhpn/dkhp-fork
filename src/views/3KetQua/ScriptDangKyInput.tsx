import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import type { InputBaseProps, Theme } from '@mui/material';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { extractListMaLop } from '../../utils';
import { selectIsChiVeTkb, selectPhanLoaiHocTrenTruong, selectTextareaChiVeTkb, useTkbStore } from '../../zus';
import { getScriptDkhp } from './utils';

const DEFAULT_TOOLTIP = 'Click để sao chép';
const COPIED_TOOLTIP = 'Đã sao chép';

const getReadonlySx = (theme: Theme) => ({
  '& .MuiInputBase-input': {
    color: theme.palette.text.secondary,
    backgroundColor: 'var(--surface-muted, var(--surface-muted-fallback))',
    cursor: 'default',
  },
});

const CustomInputComponent: InputBaseProps['inputComponent'] = forwardRef<
  HTMLTextAreaElement,
  HTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <textarea ref={ref} style={{ resize: 'vertical', minHeight: 92 }} {...props} />);

const CustomInputComponent2: InputBaseProps['inputComponent'] = forwardRef<
  HTMLTextAreaElement,
  HTMLAttributes<HTMLTextAreaElement>
>((props, ref) => {
  const khongXepLop = useTkbStore(selectIsChiVeTkb);
  return (
    <Tooltip title={khongXepLop ? 'Mỗi mã lớp một hàng, hoặc cách nhau bằng khoảng trắng, hoặc dấu phẩy' : ''}>
      <textarea ref={ref} style={{ resize: 'vertical', minHeight: 92 }} {...props} />
    </Tooltip>
  );
});

const useCommon = () => {
  const cacLop = useTkbStore(selectPhanLoaiHocTrenTruong);
  const listMaLop = useMemo(() => extractListMaLop(cacLop.flat()), [cacLop]);
  const script = useMemo(() => getScriptDkhp(listMaLop), [listMaLop]);
  const hasLop = listMaLop.length > 0;

  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const textareaChiVeTkb = useTkbStore(selectTextareaChiVeTkb);

  const dsLopInputValue = (() => {
    if (isChiVeTkb) return textareaChiVeTkb;
    if (!hasLop) return 'Chưa có lớp nào';
    return listMaLop.join(',');
  })();

  const scriptInputValue = (() => {
    if (!hasLop) return 'Chưa có lớp nào';
    return script;
  })();

  return {
    hasLop,
    isChiVeTkb,
    dsLopInputValue,
    scriptInputValue,
  };
};

export function ScriptDangKyInput() {
  const theme = useTheme();
  const [isCopying, setIsCopying] = useState(false);
  const { hasLop, scriptInputValue } = useCommon();
  return (
    <Grid item xs={12} md={6} style={{ paddingRight: 0 }}>
      <TextField
        label="Script đăng ký nhanh"
        fullWidth
        multiline
        minRows={4}
        maxRows={10}
        value={scriptInputValue}
        disabled={!hasLop}
        inputProps={{ readOnly: true }}
        sx={getReadonlySx(theme)}
        InputProps={{
          inputComponent: CustomInputComponent,
          endAdornment: hasLop ? (
            <Tooltip title={isCopying ? COPIED_TOOLTIP : DEFAULT_TOOLTIP}>
              <IconButton
                aria-label="Sao chép script đăng ký nhanh"
                onClick={() => {
                  navigator.clipboard.writeText(scriptInputValue).then(
                    () => {
                      setIsCopying(true);
                      setTimeout(() => setIsCopying(false), 3000);
                    },
                    () => {
                      enqueueSnackbar('Không thể sao chép', { variant: 'error' });
                    },
                  );
                }}
                edge="end"
                size="small"
              >
                <ContentCopyIcon color={isCopying ? 'primary' : undefined} />
              </IconButton>
            </Tooltip>
          ) : undefined,
        }}
      />
    </Grid>
  );
}

export function DanhSachLopInput() {
  const theme = useTheme();
  const setTextareChiVeTkb = useTkbStore((s) => s.setTextareChiVeTkb);
  const { hasLop, dsLopInputValue, isChiVeTkb } = useCommon();
  const useToolXepLop = !isChiVeTkb;

  return (
    <Grid item xs={12} md={6}>
      <TextField
        label="Danh sách mã lớp"
        fullWidth
        multiline
        inputProps={{ readOnly: useToolXepLop, style: { resize: 'vertical', minHeight: 92 } }}
        minRows={4}
        maxRows={10}
        onChange={(e) => {
          setTextareChiVeTkb(e.target.value);
        }}
        value={dsLopInputValue}
        disabled={useToolXepLop && !hasLop}
        sx={useToolXepLop ? getReadonlySx(theme) : undefined}
        InputProps={{
          inputComponent: CustomInputComponent2,
          endAdornment:
            useToolXepLop && hasLop ? (
              <Tooltip title="Chia sẻ TKB">
                <IconButton
                  aria-label="Tạo link chia sẻ thời khóa biểu"
                  edge="end"
                  size="small"
                  onClick={() => {
                    const newUrl =
                      window.location.origin + window.location.pathname + '?self_selected=' + dsLopInputValue;
                    navigator.clipboard.writeText(newUrl);
                    window.open(newUrl, Math.random()?.toString());
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            ) : null,
        }}
      />
    </Grid>
  );
}

export default ScriptDangKyInput;
