import React, { useRef } from 'react';
import { selectIsChiVeTkb, useTkbStore } from '../../zus';

type TabConfig = {
  id: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

function ModeTabs() {
  const setIsChiVeTkb = useTkbStore((s) => s.setIsChiVeTkb);
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabs: TabConfig[] = [
    {
      id: 'mode-tab-grid',
      label: 'Xếp lớp',
      selected: !isChiVeTkb,
      onSelect: () => setIsChiVeTkb(false),
    },
    {
      id: 'mode-tab-manual',
      label: 'Nhập mã lớp',
      selected: isChiVeTkb,
      onSelect: () => setIsChiVeTkb(true),
    },
  ];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();

    const nextIndex =
      event.key === 'ArrowLeft'
        ? (index - 1 + tabs.length) % tabs.length
        : (index + 1) % tabs.length;

    tabs[nextIndex].onSelect();
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <nav className="mode-tabs-nav" aria-label="Chế độ làm việc">
      <div role="tablist" className="mode-tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tab.id}
            aria-selected={tab.selected}
            tabIndex={tab.selected ? 0 : -1}
            className={`mode-tab${tab.selected ? ' mode-tab--active' : ''}`}
            onClick={tab.onSelect}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default ModeTabs;