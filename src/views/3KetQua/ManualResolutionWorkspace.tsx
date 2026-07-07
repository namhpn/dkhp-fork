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
  countResolvedSubjects,
  countUnresolvedSubjects,
  findNextUnresolvedSubject,
  formatClassRowMeta,
  formatComboCodeLabel,
  getComboClassRows,
  getSubjectCourseName,
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
          <span key={row.MaLop} className="manual-resolution-card__meta">
            {formatClassRowMeta(row)}
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

  const resolvedCount = useMemo(
    () => countResolvedSubjects(queueOrder, selectedCombo, subjectCombos),
    [queueOrder, selectedCombo, subjectCombos],
  );

  const totalCount = queueOrder.length;
  const allResolved = totalCount > 0 && unresolvedCount === 0;

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
      const newManualResolvedMaLop = [...otherCodes, ...combo.fullCodes];
      setManualResolvedMaLop(newManualResolvedMaLop);

      const updatedSelectedCombo = buildSelectedComboMap(newManualResolvedMaLop);
      const updatedSubjectCombos = buildSubjectCombos(recommendations, newManualResolvedMaLop);
      const updatedQueueOrder = buildSubjectQueueOrder(updatedSubjectCombos);
      const nextSubject = findNextUnresolvedSubject(
        updatedQueueOrder,
        updatedSubjectCombos,
        updatedSelectedCombo,
        subject,
      );
      if (nextSubject) {
        setActiveSubject(nextSubject);
      }
    }
  };

  const activeCombos = activeSubject ? subjectCombos[activeSubject] ?? [] : [];
  const activeCourseName = useMemo(
    () => (activeCombos.length > 0 ? getSubjectCourseName(activeCombos, classByMaLop) : null),
    [activeCombos, classByMaLop],
  );
  const showResolution = queueOrder.length > 0;

  return (
    <div
      className={
        'manual-resolution-workspace' + (showResolution ? ' manual-resolution-workspace--resolving' : '')
      }
    >
      <DanhSachLopInput />

      {showResolution && (
        <div className="manual-resolution-body">
          <nav className="manual-resolution-nav" aria-label="Mã cần chọn">
            <p
              className={
                'manual-resolution-progress' +
                (allResolved ? ' manual-resolution-progress--complete' : '')
              }
              aria-live="polite"
            >
              {allResolved
                ? `Đã chọn ${totalCount}/${totalCount} mã`
                : `Còn ${unresolvedCount} mã cần chọn · Đã chọn ${resolvedCount}/${totalCount}`}
            </p>
            <ul className="manual-resolution-subject-list">
              {queueOrder.map((subject) => {
                const combos = subjectCombos[subject] ?? [];
                const resolved = combos.some((combo) =>
                  isSelectedCombo(subject, combo, selectedCombo),
                );
                const isActive = subject === activeSubject;
                const courseName =
                  combos.length > 0 ? getSubjectCourseName(combos, classByMaLop) : null;

                return (
                  <li key={subject}>
                    <button
                      type="button"
                      className={
                        'manual-resolution-subject' +
                        (isActive ? ' manual-resolution-subject--active' : '') +
                        (resolved ? ' manual-resolution-subject--resolved' : '')
                      }
                      onClick={() => setActiveSubject(subject)}
                      aria-current={isActive ? 'true' : undefined}
                      aria-label={`${subject}, ${resolved ? 'đã chọn' : 'chưa chọn'}`}
                      title={courseName ?? undefined}
                    >
                      {resolved && !isActive && (
                        <CheckIcon className="manual-resolution-subject__check" aria-hidden="true" />
                      )}
                      <span>{subject}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <section
            id="manual-resolution-cards-panel"
            className="manual-resolution-cards"
            aria-labelledby="manual-resolution-cards-heading"
          >
            {activeSubject && (
              <div className="manual-resolution-cards__header">
                <h3 id="manual-resolution-cards-heading" className="manual-resolution-cards__title">
                  <span className="manual-resolution-cards__code">{activeSubject}</span>
                  {activeCourseName && (
                    <>
                      <span className="manual-resolution-cards__sep" aria-hidden="true">
                        {' · '}
                      </span>
                      <span className="manual-resolution-cards__course">{activeCourseName}</span>
                    </>
                  )}
                </h3>
              </div>
            )}
            <div className="manual-resolution-cards__list">
              {activeCombos.length === 0 ? (
                <p className="manual-resolution-cards__empty">Không có gợi ý lớp cho mã này.</p>
              ) : (
                activeCombos.map((combo) => (
                  <RecommendationCard
                    key={combo.bundleKey}
                    subject={activeSubject ?? combo.subject}
                    combo={combo}
                    selected={isSelectedCombo(activeSubject ?? combo.subject, combo, selectedCombo)}
                    classByMaLop={classByMaLop}
                    onToggle={() => handleToggleCombo(activeSubject ?? combo.subject, combo)}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default ManualResolutionWorkspace;