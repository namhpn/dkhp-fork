import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import { default as MuiDrawer } from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/styles';
import makeStyles from '@mui/styles/makeStyles';
import logoUit from 'assets/img/logo-uit.png';
import clsx from 'clsx';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import { ROUTES } from '../../../constants';
import { useDrawerStore } from '../../../zus';

const drawerWidth = 248;
const drawerWidthClosed = 72;

const ROUTE_ICONS = [UploadFileOutlinedIcon, TableChartOutlinedIcon, FactCheckOutlinedIcon];

const openCloseMixin = (theme) =>
  ({
    overflowX: 'hidden',
  } as const);

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...openCloseMixin(theme),
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : drawerWidthClosed,
    padding: '16px 10px',
    color: '#dbeafe',
    background: 'linear-gradient(180deg, #0f172a 0%, #172554 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '12px 0 36px rgba(15, 23, 42, 0.22)',
    ...openCloseMixin(theme),
  },
}));

function LeftDrawer() {
  const classes = useStyles();
  const toggleDrawer = useDrawerStore((s) => s.toggleDrawer);
  const isOpen = useDrawerStore((s) => s.isDrawerOpen);
  const isCollapsed = !isOpen;
  const location = useLocation();
  const history = useHistory();

  useHotkeys(['shift+`', 'alt+`'], () => toggleDrawer());
  useHotkeys(['shift+1', 'alt+1'], () => history.push(ROUTES._1ChonFileExcel.path));
  useHotkeys(['shift+2', 'alt+2'], () => history.push(ROUTES._2XepLop.path));
  useHotkeys(['shift+3', 'alt+3'], () => history.push(ROUTES._3KetQua.path));

  return (
    <nav className={classes.drawer} aria-label="Luồng đăng ký học phần">
      <Drawer className={classes.drawer} variant="permanent" open={isOpen}>
        <Box className={classes.brandRow}>
          <Box className={classes.logoBox}>
            <img src={logoUit} alt="UIT" className={classes.logo} />
          </Box>
          <Box className={clsx(classes.brandCopy, isCollapsed && classes.collapsedOnly)}>
            <Typography className={classes.brandTitle}>UIT Course Planner</Typography>
            <Typography className={classes.brandSubtitle}>Xếp lớp nhanh, giữ dữ liệu cục bộ</Typography>
          </Box>
        </Box>

        <Tooltip title={isOpen ? 'Thu gọn thanh điều hướng' : 'Mở rộng thanh điều hướng'} placement="right">
          <IconButton className={classes.toggleButton} onClick={toggleDrawer} size="large" aria-label="Đóng mở menu">
            <KeyboardDoubleArrowLeftIcon className={clsx(classes.collapseIcon, isCollapsed && classes.collapseIconCollapsed)} />
          </IconButton>
        </Tooltip>

        <List className={classes.list}>
          {Object.values(ROUTES).map((route, index) => {
            const Icon = ROUTE_ICONS[index];
            return (
              <Tooltip key={route.path} title={isCollapsed ? route.name : ''} placement="right">
                <ListItem
                  className={classes.listItem}
                  button
                  component={NavLink}
                  to={route.path + location.search}
                  activeClassName={classes.menuItemActive}
                >
                  <ListItemIcon className={classes.listIcon}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={route.name}
                    primaryTypographyProps={{ className: classes.listText }}
                    className={clsx(isCollapsed && classes.collapsedOnly)}
                  />
                </ListItem>
              </Tooltip>
            );
          })}
        </List>

        <Box className={clsx(classes.footerPanel, isCollapsed && classes.collapsedOnly)}>
          <Typography className={classes.footerTitle}>Phím tắt</Typography>
          <Typography className={classes.footerText}>Shift/Alt + 1, 2, 3 để chuyển bước. Shift/Alt + ` để thu gọn menu.</Typography>
        </Box>
      </Drawer>
    </nav>
  );
}

export default LeftDrawer;

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minHeight: 72,
    padding: '4px 4px 12px',
  },
  logoBox: {
    display: 'grid',
    width: 48,
    height: 48,
    flex: '0 0 auto',
    placeItems: 'center',
    background: '#ffffff',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.18)',
  },
  logo: {
    display: 'block',
    width: 32,
    height: 32,
    objectFit: 'contain',
  },
  brandCopy: {
    minWidth: 0,
    opacity: 1,
    transition: 'opacity 0.16s ease',
  },
  brandTitle: {
    color: '#ffffff',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    lineHeight: 1.05,
  },
  brandSubtitle: {
    marginTop: 4,
    color: '#bfdbfe',
    fontSize: 12,
    lineHeight: 1.35,
    whiteSpace: 'normal',
  },
  toggleButton: {
    width: '100%',
    height: 42,
    marginBottom: 16,
    color: '#bfdbfe',
    background: 'rgba(255, 255, 255, 0.08)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.13)',
    },
  },
  collapseIcon: {
    transform: 'rotate(0deg)',
  },
  collapseIconCollapsed: {
    transform: 'rotate(180deg)',
  },
  list: {
    display: 'grid',
    gap: 8,
    paddingTop: 4,
  },
  listItem: {
    minHeight: 48,
    padding: '8px 12px',
    color: '#bfdbfe',
    borderRadius: 12,
    userSelect: 'none',
    transition: 'all 0.18s ease',
    '&:hover': {
      color: '#ffffff',
      background: 'rgba(255, 255, 255, 0.1)',
    },
  },
  menuItemActive: {
    color: '#ffffff',
    background: 'linear-gradient(135deg, #1e40af, #2563eb)',
    boxShadow: '0 8px 18px rgba(30, 64, 175, 0.28)',
    '& $listIcon': {
      color: '#ffffff',
    },
  },
  listIcon: {
    minWidth: 34,
    color: '#93c5fd',
  },
  listText: {
    color: 'inherit',
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '-0.01em',
  },
  collapsedOnly: {
    opacity: 0,
    pointerEvents: 'none',
    width: 0,
    overflow: 'hidden',
  },
  footerPanel: {
    margin: 'auto 0 0',
    padding: 14,
    whiteSpace: 'normal',
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
  },
  footerTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  footerText: {
    marginTop: 8,
    color: '#bfdbfe',
    fontSize: 12,
    lineHeight: 1.5,
  },
}));
