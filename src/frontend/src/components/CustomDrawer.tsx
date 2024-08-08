import MuiDrawer from "@mui/material/Drawer";
import {Divider, List, ListItemButton, ListItemIcon, ListItemText, styled} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import {CalendarMonth} from "@mui/icons-material";
import React from "react";
import {useNavigate} from "react-router-dom";

/**
 * List of the main items in the sidebar.
 */
export const mainListItems = [
    {
        name: 'Home',
        href: "/",
        icon: <HomeIcon/>,
    },
    /*{
        name: 'About',
        href: "/about",
        icon: <AboutIcon/>,
    },*/
    {
        name: 'Calendar',
        href: "/calendar/:userId",
        icon: <CalendarMonth/>,
    }
]

/**
 * List of the secondary items in the sidebar.
 */
export const secondaryListItems: { name: string, href: string, icon: JSX.Element }[] = [
    /*{
        name: 'New Project',
        href: WebUiUris.NEW_PROJECT,
        icon: <NewProjectIcon/>,
    },
    {
        name: 'Open Project',
        href: WebUiUris.OPEN_PROJECT,
        icon: <OpenProjectIcon/>,
    },*/
]

export const drawerWidth: number = 200

export const CustomDrawer = ({open}: { open: boolean }) => {
    const navigate = useNavigate()

    return (
        <StyledDrawer variant="permanent" open={open}>
            <List component="nav">
                {
                    mainListItems.map((item) => {
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
        </StyledDrawer>
    )
}
/**
 * Drawer component.
 */
const StyledDrawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            position: 'absolute',
            whiteSpace: 'nowrap',
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(7),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(8),
                },
            }),
        },
    }),
)