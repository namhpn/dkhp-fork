import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { COLORS } from '../../constants';
import { getTongSoTcJudgement } from '../../utils';
import { selectTongSoTcSelected, useTkbStore } from '../../zus';

function SoTinChi(props: { tongSoTcSelected?: number }) {
  const tongSoTcSelectedB2 = useTkbStore(selectTongSoTcSelected);
  const tongSoTcSelected = props.tongSoTcSelected ?? tongSoTcSelectedB2;
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
          background: judgement.isOk ? '#d1fae5' : '#fee2e2',
          borderRadius: 999,
          fontWeight: 800,
        }}
      >
        Số tín chỉ: <b>{tongSoTcSelected}</b>
      </Typography>
    </Tooltip>
  );
}

export default SoTinChi;
