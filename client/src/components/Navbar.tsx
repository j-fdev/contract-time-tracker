import { useState } from 'react';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import MenuIcon from '@mui/icons-material/Menu';
import {
    AppBar,
    Box,
    Button,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Tab,
    Tabs,
    Toolbar,
    Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_LINKS = [
    { label: 'Punch Card', path: 'punch' },
    { label: 'Projects', path: 'projects' },
    { label: 'Clients', path: 'clients' },
] as const;

type NavPath = (typeof NAV_LINKS)[number]['path'];

interface NavbarProps {
    projectName: string | null;
    onChangeProject: () => void;
}

export default function Navbar({ projectName, onChangeProject }: NavbarProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const currentSegment = location.pathname.split('/').pop();
    const activePath = NAV_LINKS.find((link) => link.path === currentSegment)?.path ?? 'punch';

    const goTo = (path: NavPath) => {
        navigate(`/dashboard/${path}`);
        setIsDrawerOpen(false);
    };

    return (
        <>
            <AppBar position="static" sx={{ bgcolor: 'primary.main', boxShadow: '0 10px 24px rgba(8, 21, 139, 0.35)' }}>
                <Toolbar sx={{ minHeight: 72, gap: 3 }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="Open navigation menu"
                        onClick={() => setIsDrawerOpen(true)}
                        sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 800, letterSpacing: 0.5 }}>CONTRACT TIME TRACKER</Typography>
                    <Tabs
                        value={activePath}
                        onChange={(_event, path: NavPath) => goTo(path)}
                        textColor="inherit"
                        sx={{ display: { xs: 'none', md: 'flex' } }}
                        slotProps={{ indicator: { sx: { bgcolor: '#ffffff' } } }}
                    >
                        {NAV_LINKS.map((link) => (
                            <Tab key={link.path} label={link.label} value={link.path} />
                        ))}
                    </Tabs>
                    <Button
                        color="inherit"
                        variant="outlined"
                        startIcon={<FolderOpenIcon />}
                        onClick={onChangeProject}
                        title="Change or create a project"
                        sx={{ ml: 'auto', textTransform: 'none', borderColor: 'rgba(255, 255, 255, 0.5)', maxWidth: { xs: 160, sm: 280 } }}
                    >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {projectName ?? 'Choose a project'}
                        </Box>
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} sx={{ display: { md: 'none' } }}>
                <Box sx={{ width: 240 }} role="presentation">
                    <List>
                        {NAV_LINKS.map((link) => (
                            <ListItem key={link.path} disablePadding>
                                <ListItemButton selected={activePath === link.path} onClick={() => goTo(link.path)}>
                                    <ListItemText primary={link.label} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
        </>
    );
}
