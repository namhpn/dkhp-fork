import CheckIcon from '@mui/icons-material/Check';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useEffect, useMemo, useState } from 'react';
import {
  selectFinalDataTkb,
  selectManualRecommendations,
  selectManualResolvedMaLop,
  useTkbStore,
} from '../../zus';
import { DanhSachLopInput } from './ScriptDangKyInput';
import {
  buildSelectedComboMap,
  buildSubjectCombos,
  buildSubjectQueueOrder,
  countUnresolvedSubjects,
  formatClassSchedule,
  formatComboCodeLabel,
  getComboClassRows,
  getSubjectFromCode,
  isSelectedCombo,
  type SuggestionCombo,
} from './manualResolutionHelpers';

function RecommendationCard({
  subject,
  combo,
  selected,
  classByMaLop,
  onToggle,
}: {
  subject: string;
  combo: SuggestionCombo;
  selected: boolean;
  classByMaLop: Map<string, import('../../types').ClassModel>;
  onToggle: () => void;
}) {
  const rows = getComboClassRows(combo, classByMaLop);
  const codeLabel = formatComboCodeLabel(combo);
  const ariaLabel = selected ? `Bỏ chọn ${codeLabel}` : `Chọn ${codeLabel}`;

  return (
    <button
      type="button"
      className={'manual-resolution-card' + (selected ? ' manual-resolution-card--selected' : '')}
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={ariaLabel}
    >
      <span className="manual-resolution-card__icon" aria-hidden="true">
        {selected ? <CheckIcon /> : <RadioButtonUncheckedIcon />}
      </span>
      <span className="manual-resolution-card__body">
        <span className="manual-resolution-card__code">{codeLabel}</span>
        {rows.map((row) => (
          <span key={row.MaLop} className="manual-resolution-card__detail">
            {row.TenMH && <span className="manual-resolution-card__course">{row.TenMH}</span>}
            <span className="manual-resolution-card__meta">
              {[row.TenGV, formatClassSchedule(row), row.PhongHoc].filter(Boolean).join(' · ')}
            </span>
          </span>
        ))}
        {rows.length === 0 && (
          <span className="manual-resolution-card__meta manual-resolution-card__meta--muted">
            Chưa có thông tin lớp
          </span>
        )}
      </span>
    </button>
  );
}

export function ManualResolutionWorkspace() {
  const recommendations = useTkbStore(selectManualRecommendations);
  const manualResolvedMaLop = useTkbStore(selectManualResolvedMaLop);
  const setManualResolvedMaLop = useTkbStore((s) => s.setManualResolvedMaLop);
  const finalDataTkb = useTkbStore(selectFinalDataTkb);

  const classByMaLop = useMemo(() => {
    const map = new Map<string, import('../../types').ClassModel>();
    finalDataTkb.forEach((row) => map.set(row.MaLop, row));
    return map;
  }, [finalDataTkb]);

  const subjectCombos = useMemo(
    () => buildSubjectCombos(recommendations, manualResolvedMaLop),
    [recommendations, manualResolvedMaLop],
  );

  const selectedCombo = useMemo(() => buildSelectedComboMap(manualResolvedMaLop), [manualResolvedMaLop]);

  const queueOrder = useMemo(() => buildSubjectQueueOrder(subjectCombos), [subjectCombos]);

  const unresolvedCount = useMemo(
    () => countUnresolvedSubjects(queueOrder, selectedCombo, subjectCombos),
    [queueOrder, selectedCombo, subjectCombos],
  );

  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  useEffect(() => {
    if (queueOrder.length === 0) {
      setActiveSubject(null);
      return;
    }

    if (!activeSubject || !queueOrder.includes(activeSubject)) {
      const firstUnresolved = queueOrder.find((subject) => {
        const combos = subjectCombos[subject];
        return combos && !combos.some((combo) => isSelectedCombo(subject, combo, selectedCombo));
      });
      setActiveSubject(firstUnresolved ?? queueOrder[0]);
    }
  }, [queueOrder, activeSubject, subjectCombos, selectedCombo]);

  const handleToggleCombo = (subject: string, combo: SuggestionCombo) => {
    const otherCodes = manualResolvedMaLop.filter((code) => getSubjectFromCode(code) !== subject);

    if (isSelectedCombo(subject, combo, selectedCombo)) {
      setManualResolvedMaLop(otherCodes);
    } else {
      setManualResolvedMaLop([...otherCodes, ...combo.fullCodes]);
    }
  };

  const activeCombos = activeSubject ? subjectCombos[activeSubject] ?? [] : [];
  const showResolution = queueOrder.length > 0;

  return (
    <div className="manual-resolution-workspace">
      <DanhSachLopInput />

      {showResolution && (
        <div className="manual-resolution-body">
          <aside className="manual-resolution-queue" aria-label="Mã cần chọn">
            {unresolvedCount > 0 && (
              <p className="manual-resolution-progress">Còn {unresolvedCount} mã cần chọn</p>
            )}
            <ul className="manual-resolution-queue-list">
              {queueOrder.map((subject) => {
                const resolved = subjectCombos[subject]?.some((combo) =>
                  isSelectedCombo(subject, combo, selectedCombo),
                );
                const isActive = subject === activeSubject;

                return (
                  <li key={subject}>
                    <button
                      type="button"
                      className={
                        'manual-resolution-queue-item' +
                        (isActive ? ' manual-resolution-queue-item--active' : '') +
                        (resolved ? ' manual-resolution-queue-item--resolved' : '')
                      }
                      onClick={() => setActiveSubject(subject)}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      {resolved && (
                        <CheckIcon className="manual-resolution-queue-item__check" aria-hidden="true" />
                      )}
                      <span>{subject}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="manual-resolution-cards" aria-label="Gợi ý lớp">
            {activeSubject && (
              <div className="manual-resolution-cards__header">
                <h3 className="manual-resolution-cards__title">{activeSubject}</h3>
              </div>
            )}
            <div className="manual-resolution-cards__list">
              {activeCombos.map((combo) => (
                <RecommendationCard
                  key={combo.bundleKey}
                  subject={activeSubject ?? combo.subject}
                  combo={combo}
                  selected={isSelectedCombo(activeSubject ?? combo.subject, combo, selectedCombo)}
                  classByMaLop={classByMaLop}
                  onToggle={() => handleToggleCombo(activeSubject ?? combo.subject, combo)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManualResolutionWorkspace;