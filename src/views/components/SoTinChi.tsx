import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { COLORS } from '../../constants';
import { getTongSoTcJudgement } from '../../utils';
import { selectTongSoTcSelected, useTkbStore } from '../../zus';

function SoTinChi(props: { tongSoTcSelected?: number }) {
  const selectedCreditsFromStore = useTkbStore(selectTongSoTcSelected);
  const tongSoTcSelected = props.tongSoTcSelected ?? selectedCreditsFromStore;
  const judgement = getTongSoTcJudgement(tongSoTcSelected);

  return (
    <Tooltip title={judgement.text}>
      <Typography
        component="p"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          minHeight: 32,
          margin: 0,
          padding: '4px 10px',
          color: judgement.isOk ? COLORS.SUCCESS : COLORS.ERROR,
          background: judgement.isOk ? 'var(--success-soft, var(--success-soft-fallback))' : 'var(--error-soft, var(--error-soft-fallback))',
          borderRadius: 999,
          fontWeight: 700,
        }}
      >
        Số tín chỉ: <b>{tongSoTcSelected}</b>
      </Typography>
    </Tooltip>
  );
}

export default SoTinChi;
