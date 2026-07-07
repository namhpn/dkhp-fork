import React from 'react';
import { getUrlResolvedMaLop, selectTextareaChiVeTkb, useTkbStore } from '../../zus';
import { DanhSachLopInput, SuggestionPanel } from '../3KetQua/ScriptDangKyInput';

function ManualWorkspace() {
  const textareaChiVeTkb = useTkbStore(selectTextareaChiVeTkb);
  const hasUrlResolved = getUrlResolvedMaLop() !== null;

  return (
    <div className="manual-workspace">
      {!textareaChiVeTkb && !hasUrlResolved && (
        <div className="manual-input-notice">
          <span>Hãy nhập vào ô Danh sách mã lớp để xếp thời khoá biểu</span>
        </div>
      )}
      <div className="output-panel">
        <div className="output-fields-row">
          <DanhSachLopInput />
          <SuggestionPanel />
        </div>
      </div>
    </div>
  );
}

export default ManualWorkspace;