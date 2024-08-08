import {
    AppBar,
    Box,
    ButtonBase,
    CssBaseline,
    Divider,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography
} from "@mui/material";
import {useNavigate} from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu'
import React, {useState} from "react";
import {CustomDrawer, mainListItems, secondaryListItems} from "./components/CustomDrawer";

/**
 * Props of the Dashboard component.
 *
 * @property children the main content of the dashboard
 */
interface DashboardProps {
    children: React.ReactNode
}

export default function AppDashboard({children}: DashboardProps) {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    // If this value changes, this all component is re-executed, allowing to update
    // the primary hrefs
    const [logged, setLogged] = useState<boolean | undefined>(undefined)

    const toggleDrawer = () => {
        setOpen(!open)
    }

    return (
        <Box sx={{display: 'flex'}}>
            <CssBaseline/>
            <AppBar position="absolute">
                <Toolbar sx={{pr: '24px'}}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{mr: '36px'/*, ...(open && {display: 'none'})*/}}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Box sx={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <ButtonBase onClick={() => navigate("/")}
                                    sx={{display: 'flex', alignItems: 'center'}}>
                            {/*<img alt="logo" src={Logo} width={40} height={40} style={{marginRight: '10px'}}/>*/}
                            <Typography component="h1" variant="body1" color="inherit" noWrap>
                                <strong>21 Days</strong>
                            </Typography>
                        </ButtonBase>
                    </Box>
                    {/*{
                        loggedIn
                            ? <AccountMenu
                                avatar={loggedIn && session?.picture ? session.picture : ""}
                                settings={authSettings}
                            />
                            : <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size={"small"}
                                    onClick={() => window.location.href = WebUiUris.SIGN_UP}
                                >
                                    Sign Up
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size={"small"}
                                    onClick={() => window.location.href = WebUiUris.LOGIN}
                                >
                                    Sign In
                                </Button>
                            </>
                    }*/}
                </Toolbar>
            </AppBar>
            <CustomDrawer variant="permanent" open={open}>
                <List component="nav">
                    {
                        mainListItems.map((item) => {

                            if (item.href.includes(':userId')) {

                                // Remember: later we won't user cache. This is a solution just for the moment
                                const userId = localStorage['userId']
                                if (userId == undefined) {
                                    item.href = '/log-in'
                                    return
                                }
                                item.href = item.href.replace(':userId', userId)
                            }

                            return (
                                <ListItemButton onClick={() => navigate(item.href)} key={item.name}>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name}/>
                                </ListItemButton>
                            )
                        })
                    }
                    {secondaryListItems.length != 0 && <Divider sx={{my: 1}}/>}
                    {
                        secondaryListItems.length != 0 && secondaryListItems.map((item) => {
                            return (
                                <ListItemButton onClick={() => navigate(item.href)} key={item.name}>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name}/>
                                </ListItemButton>
                            )
                        })
                    }
                </List>
            </CustomDrawer>
            <Box component="main" sx={{
                backgroundColor: "#F5F5F5",/*(theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],*/
                flexGrow: 1,
                marginLeft: '64px',
                height: '100vh',
                overflow: 'auto',
            }}>
                <Toolbar/>
                {children}
            </Box>
        </Box>
    )
}