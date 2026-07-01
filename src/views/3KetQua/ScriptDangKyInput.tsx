import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import type { InputBaseProps, Theme } from '@mui/material';
import TextField from '@mui/material/TextField';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import type { Bundle, RecommendationGroup } from '../../manualInput';
import { extractListMaLop } from '../../utils';
import {
  getUrlResolvedMaLop,
  selectIsChiVeTkb,
  selectManualParseErrorMessages,
  selectManualRecommendations,
  selectManualResolvedMaLop,
  selectPhanLoaiHocTrenTruong,
  selectSelectedClassesOutput,
  selectTextareaChiVeTkb,
  useTkbStore,
} from '../../zus';
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
    if (isChiVeTkb) {
      // Show the textarea content (user's input), not the resolved output
      return textareaChiVeTkb || '';
    }
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

// ---------------------------------------------------------------------------
// Suggestion Panel — replaces Script field in manual mode
// ---------------------------------------------------------------------------

type SuggestionCombo = {
  subject: string;
  baseCode: string;
  practiceCodes: string[];
  practiceLabels: string[];
  fullCodes: string[];
  bundleKey: string;
  standaloneSuffixPenalty: number;
  variantRank: number;
  originalIndex: number;
};

const getSubjectFromCode = (code: string): string => {
  const dotIdx = code.indexOf('.');
  return dotIdx === -1 ? code : code.substring(0, dotIdx);
};

const getCompactPracticeLabel = (practiceCode: string): string => {
  const parts = practiceCode.split('.');
  return parts.length > 1 ? parts.slice(1).join('.') : practiceCode;
};

const getBundleKey = (codes: string[]): string => codes.slice().sort().join('|');

const isRecommendationChoiceBundle = (rec: RecommendationGroup, bundle: Bundle): boolean => {
  const subject = getSubjectFromCode(bundle.baseCode);
  return rec.resolvedCourseIds.includes(subject) || rec.resolvedCourseIds.includes(bundle.baseCode);
};

const recommendationContainsCodes = (rec: RecommendationGroup, codes: string[]): boolean => {
  if (codes.length === 0) return true;
  const recCodes = new Set(rec.bundles.flatMap((bundle) => bundle.codes));
  return codes.every((code) => recCodes.has(code));
};

const comboFromBundle = (bundle: Bundle): SuggestionCombo => {
  const practiceCodes = bundle.codes.filter((code) => code !== bundle.baseCode);
  return {
    subject: getSubjectFromCode(bundle.baseCode),
    baseCode: bundle.baseCode,
    practiceCodes,
    practiceLabels: practiceCodes.map(getCompactPracticeLabel),
    fullCodes: bundle.codes,
    bundleKey: getBundleKey(bundle.codes),
    standaloneSuffixPenalty: bundle.standaloneSuffixPenalty,
    variantRank: bundle.variantRank,
    originalIndex: bundle.originalIndex,
  };
};

const compareSuggestionCombos = (a: SuggestionCombo, b: SuggestionCombo): number => {
  return (
    a.standaloneSuffixPenalty - b.standaloneSuffixPenalty ||
    a.baseCode.localeCompare(b.baseCode) ||
    a.variantRank - b.variantRank ||
    a.originalIndex - b.originalIndex ||
    a.practiceLabels.join(',').localeCompare(b.practiceLabels.join(','))
  );
};

export function SuggestionPanel() {
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const recommendations = useTkbStore(selectManualRecommendations);
  const setManualResolvedMaLop = useTkbStore((s) => s.setManualResolvedMaLop);
  const manualResolvedMaLop = useTkbStore(selectManualResolvedMaLop);
  const selectedOutput = useTkbStore(selectSelectedClassesOutput);
  const cacLop = useTkbStore(selectPhanLoaiHocTrenTruong);
  const { isCopied: isScriptCopied, copy: copyScript } = useCopyButton();

  // Compute registration script from resolved classes (unconditional — hooks before early return)
  const listMaLop = useMemo(() => extractListMaLop(cacLop.flat()), [cacLop]);
  const script = useMemo(() => getScriptDkhp(listMaLop), [listMaLop]);
  const hasScript = listMaLop.length > 0;


  // Per-subject combos are derived from recommendation bundles, not from
  // MaLop dot-count. This keeps MonHoc / ThucHanh semantics aligned with
  // manualInput.ts and still renders compact practice labels like
  // `IT003.O22 + O22.1`.
  const subjectCombos = useMemo(() => {
    const subjects = new Set<string>();

    for (const rec of recommendations) {
      for (const bundle of rec.bundles) {
        if (isRecommendationChoiceBundle(rec, bundle)) {
          subjects.add(getSubjectFromCode(bundle.baseCode));
        }
      }
    }

    const map: Record<string, SuggestionCombo[]> = {};

    for (const subject of subjects) {
      const selectedOtherSubjectCodes = manualResolvedMaLop.filter((code) => getSubjectFromCode(code) !== subject);
      const seen = new Set<string>();
      const combos: SuggestionCombo[] = [];

      for (const rec of recommendations) {
        if (!recommendationContainsCodes(rec, selectedOtherSubjectCodes)) continue;

        for (const bundle of rec.bundles) {
          if (!isRecommendationChoiceBundle(rec, bundle)) continue;
          if (getSubjectFromCode(bundle.baseCode) !== subject) continue;

          const combo = comboFromBundle(bundle);
          if (seen.has(combo.bundleKey)) continue;

          seen.add(combo.bundleKey);
          combos.push(combo);
        }
      }

      if (combos.length > 0) {
        map[subject] = combos.sort(compareSuggestionCombos);
      }
    }

    return map;
  }, [recommendations, manualResolvedMaLop]);

  // Determine which combo is selected for each subject based on full codes match
  const selectedCombo = useMemo(() => {
    const map: Record<string, string[]> = {};
    manualResolvedMaLop.forEach((code) => {
      const subj = getSubjectFromCode(code);
      if (!map[subj]) map[subj] = [];
      map[subj].push(code);
    });
    return map;
  }, [manualResolvedMaLop]);

  const isSelectedCombo = (subj: string, combo: SuggestionCombo) => {
    const sel = selectedCombo[subj];
    if (!sel || sel.length !== combo.fullCodes.length) return false;
    return combo.fullCodes.every((code) => sel.includes(code));
  };

  const handleToggleCombo = (subject: string, combo: SuggestionCombo) => {
    const otherCodes = manualResolvedMaLop.filter((code) => getSubjectFromCode(code) !== subject);

    // If already selected, deselect entirely. Otherwise, replace the current
    // choice for this subject with the exact bundle codes.
    if (isSelectedCombo(subject, combo)) {
      setManualResolvedMaLop(otherCodes);
    } else {
      setManualResolvedMaLop([...otherCodes, ...combo.fullCodes]);
    }
  };

  // Wizard: ordered subjects (most constrained first = fewest combos)
  const wizardOrder = useMemo(() => {
    return Object.entries(subjectCombos)
      .sort(([, a], [, b]) => a.length - b.length)
      .map(([subj]) => subj);
  }, [subjectCombos]);

  const [wizardStep, setWizardStep] = useState(0);
  const wizardSubject = wizardOrder[wizardStep];
  const wizardCombos = wizardSubject ? subjectCombos[wizardSubject] : [];

  const handleWizardToggle = (subj: string, combo: SuggestionCombo) => {
    handleToggleCombo(subj, combo);
    // Auto-advance to next unselected subject
    const nextIdx = wizardOrder.findIndex((s, i) => i > wizardStep && !selectedCombo[s]);
    if (nextIdx !== -1) {
      setWizardStep(nextIdx);
    } else {
      const firstUnselected = wizardOrder.findIndex(s => !selectedCombo[s]);
      if (firstUnselected !== -1) setWizardStep(firstUnselected);
    }
  };

  useEffect(() => {
    if (wizardOrder.length === 0 && wizardStep !== 0) {
      setWizardStep(0);
      return;
    }

    if (wizardStep >= wizardOrder.length) {
      setWizardStep(Math.max(0, wizardOrder.length - 1));
    }
  }, [wizardOrder.length, wizardStep]);

  if (!isChiVeTkb) return null;

  const hasResolved = extractListMaLop(selectedOutput).length > 0;

  const handleCopyScript = () => {
    if (hasScript) {
      copyScript(script);
    }
  };



  return (
    <div className="field-with-action suggestion-panel sp-v2-tags">
          <div className="hdr">
            <label>Gợi ý môn học</label>
            {hasScript && (
              <button onClick={handleCopyScript}>
                {isScriptCopied ? <CheckIcon style={{fontSize:12}} /> : <ContentCopyIcon style={{fontSize:12}} />}
                {isScriptCopied ? 'Đã sao chép' : 'Sao chép'}
              </button>
            )}
          </div>
          {wizardSubject ? (
            <>
              <div className="sbj" style={{borderBottom: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: 8}}>
                <button className="sp-inline-btn"
                  disabled={wizardStep === 0}
                  onClick={() => { const p = wizardStep - 1; if (p >= 0) setWizardStep(p); }}
                  aria-label="Môn trước"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>
                <span className="sp-inline-subj">{wizardSubject}</span>
                <button className="sp-inline-btn"
                  disabled={wizardStep >= wizardOrder.length - 1}
                  onClick={() => { if (wizardStep < wizardOrder.length - 1) setWizardStep(wizardStep + 1); }}
                  aria-label="Môn sau"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
                <span className="sub" style={{marginLeft: 'auto'}}>{Object.keys(selectedCombo).length}/{wizardOrder.length}</span>
              </div>
              <div className="step-pane" key={wizardSubject}>
                <div className="sp-tags-wrap">
                  {wizardCombos.map(c => {
                    const on = isSelectedCombo(wizardSubject, c);
                    return (
                      <div key={c.bundleKey}
                        className={'sp-tag-opt' + (on ? ' sp-tag-opt--on' : '')}
                        onClick={() => handleWizardToggle(wizardSubject, c)}
                        role="button" tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleWizardToggle(wizardSubject, c); } }}>
                        {on && <CheckIcon style={{fontSize: 12, color: 'currentColor'}} />}
                        <span>{c.baseCode}</span>
                        {c.practiceLabels.length > 0 && (
                          <span className="sp-tag-prac">{' + ' + c.practiceLabels.join(' + ')}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : !hasResolved ? (
            <div className="mt">Nhập mã môn hoặc mã lớp trong ô bên cạnh</div>
          ) : (
            <div className="mt mt--ok">Đã xếp tất cả môn học</div>
          )}
        </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function DanhSachLopInput() {
  const theme = useTheme();
  const { isCopied: isShareCopied, copy: shareCopy } = useCopyButton();
  const setTextareChiVeTkb = useTkbStore((s) => s.setTextareChiVeTkb);
  const parseErrorMessages = useTkbStore(selectManualParseErrorMessages);
  const setManualResolvedMaLop = useTkbStore((s) => s.setManualResolvedMaLop);
  const selectedOutput = useTkbStore(selectSelectedClassesOutput);
  const { hasLop, dsLopInputValue, isChiVeTkb } = useCommon();
  const useToolXepLop = !isChiVeTkb;
  const hasErrors = isChiVeTkb && parseErrorMessages.length > 0;

  // Initialize from URL on mount (when shared URL is opened)
  useEffect(() => {
    const urlCodes = getUrlResolvedMaLop();
    if (urlCodes && urlCodes.length > 0) {
      // Set the textarea to show the resolved codes for display/editing
      setTextareChiVeTkb(urlCodes.join(', '));
      // Also mark them as resolved so they appear in output immediately
      setManualResolvedMaLop(urlCodes);
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine what to share
  const shareValue = useMemo(() => {
    if (isChiVeTkb) {
      // Manual mode: share resolved concrete codes
      const outputCodes = extractListMaLop(selectedOutput);
      if (outputCodes.length > 0) {
        return outputCodes.join(',');
      }
      // Fall back to textarea content if no resolved output yet
      return dsLopInputValue;
    }
    // Normal mode: share the joined MaLop list
    return dsLopInputValue;
  }, [isChiVeTkb, selectedOutput, dsLopInputValue]);

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
                  window.location.origin +
                  window.location.pathname +
                  '?self_selected=' +
                  shareValue;
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
        helperText={
          <>
            {hasErrors ? (
              <span>{parseErrorMessages.join('; ')}</span>
            ) : isChiVeTkb && !dsLopInputValue.trim() ? (
              <span>Nhập mã môn học (VD: EC201) hoặc mã lớp (VD: EC201.Q21)</span>
            ) : (
              <span>&nbsp;</span>
            )}
          </>
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
        InputProps={{
          inputComponent: CustomInputComponent2,
        }}
      />
    </div>
  );
}

export default ScriptDangKyInput;
