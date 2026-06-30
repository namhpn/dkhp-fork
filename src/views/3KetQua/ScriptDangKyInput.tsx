import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import type { InputBaseProps, Theme } from '@mui/material';
import TextField from '@mui/material/TextField';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import { extractListMaLop } from '../../utils';
import { selectIsChiVeTkb, selectPhanLoaiHocTrenTruong, selectTextareaChiVeTkb, selectUnmatchedMaLop, useTkbStore } from '../../zus';
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

function useCopyButton() {
  const [isCopying, setIsCopying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copy = (text: string) => {
    if (isCopying) return;
    setIsCopying(true);
    navigator.clipboard.writeText(text).then(
      () => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
          setIsCopying(false);
        }, 3000);
      },
      () => {
        enqueueSnackbar('Không thể sao chép', { variant: 'error' });
        setIsCopying(false);
      },
    );
  };

  return { isCopied, copy };
}

export function ScriptDangKyInput() {
  const theme = useTheme();
  const { isCopied, copy } = useCopyButton();
  const { hasLop, scriptInputValue } = useCommon();

  return (
    <div className="field-with-action">
      <div className="field-label-row">
        <label className="field-label">Script đăng ký nhanh</label>
        {hasLop && (
          <Tooltip title={isCopied ? COPIED_TOOLTIP : DEFAULT_TOOLTIP}>
            <IconButton
              aria-label="Sao chép script đăng ký nhanh"
              onClick={() => copy(scriptInputValue)}
              size="small"
              className="field-action-btn"
            >
              {isCopied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </div>
      <TextField
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
        }}
      />
    </div>
  );
}

export function DanhSachLopInput() {
  const theme = useTheme();
  const { isCopied: isShareCopied, copy: shareCopy } = useCopyButton();
  const setTextareChiVeTkb = useTkbStore((s) => s.setTextareChiVeTkb);
  const unmatchedCodes = useTkbStore(selectUnmatchedMaLop);
  const { hasLop, dsLopInputValue, isChiVeTkb } = useCommon();
  const useToolXepLop = !isChiVeTkb;
  const hasErrors = isChiVeTkb && unmatchedCodes.length > 0;

  return (
    <div className="field-with-action">
      <div className="field-label-row">
        <label className="field-label">
          Danh sách mã lớp
        </label>
        {hasLop && (
          <Tooltip title={isShareCopied ? 'Đã sao chép link' : 'Chia sẻ TKB'}>
            <IconButton
              aria-label="Tạo link chia sẻ thời khóa biểu"
              size="small"
              className="field-action-btn"
              onClick={() => {
                const newUrl =
                  window.location.origin + window.location.pathname + '?self_selected=' + dsLopInputValue;
                shareCopy(newUrl);
                window.open(newUrl, Math.random()?.toString());
              }}
            >
              {isShareCopied ? <CheckIcon fontSize="small" /> : <ShareIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </div>
      <TextField
        error={hasErrors}
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
        helperText={hasErrors ? `Không tìm thấy: ${unmatchedCodes.join(', ')}` : ' '}
        FormHelperTextProps={{
          sx: {
            marginLeft: 0,
            fontWeight: 600,
            fontSize: '0.8rem',
            lineHeight: 1.4,
            color: hasErrors ? 'var(--error, #B91C1C)' : 'transparent',
          },
        }}
        sx={isChiVeTkb && !hasErrors ? {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--blue, #2563EB)',
          },
        } : isChiVeTkb && hasErrors ? {} : getReadonlySx(theme)}
        InputProps={{
          inputComponent: CustomInputComponent2,
        }}
      />
    </div>
  );
}

export default ScriptDangKyInput;
