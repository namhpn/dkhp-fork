import clsx from 'clsx';
import React, { useRef } from 'react';
import { selectIsChiVeTkb, useTkbStore } from '../../zus';
import GridWorkspace from './GridWorkspace';
import ManualWorkspace from './ManualWorkspace';
import TimetablePanel from './TimetablePanel';
import { useWorkspaceLayout } from './useWorkspaceLayout';

export const WORKSPACE_PANEL_ID = 'workspace-panel';

function Workspace() {
  const isChiVeTkb = useTkbStore(selectIsChiVeTkb);
  const timetableRef = useRef<HTMLDivElement>(null);
  const { isStacked, isCompact } = useWorkspaceLayout(timetableRef);

  return (
    <main id="main-workspace" className={clsx('workspace', isStacked && 'workspace--stacked')} tabIndex={-1}>
      <section
        id={WORKSPACE_PANEL_ID}
        role="tabpanel"
        aria-labelledby={isChiVeTkb ? 'mode-tab-manual' : 'mode-tab-grid'}
        className="workspace-main"
      >
        {isChiVeTkb ? <ManualWorkspace /> : <GridWorkspace />}
      </section>
      <TimetablePanel ref={timetableRef} compact={isCompact} />
    </main>
  );
}

export default Workspace;
