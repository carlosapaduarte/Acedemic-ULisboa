import {AppBar, Box, ButtonBase, CssBaseline, IconButton, Toolbar, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu'
import React, {useState} from "react";
import {CustomDrawer} from "./components/CustomDrawer";

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

    const toggleDrawer = () => {
        setOpen(!open)
    }

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
            <CssBaseline/>
            <AppBar position="static">
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
            <Box sx={{position: 'relative', height: '100%', overflow: 'auto'}}>
                <CustomDrawer open={open}/>
                <Box component="main" sx={{
                    backgroundColor: "#F5F5F5",/*(theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],*/
                    flexGrow: 1,
                    marginLeft: '64px',
                    height: '100%',
                    overflow: 'auto',
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    )
}