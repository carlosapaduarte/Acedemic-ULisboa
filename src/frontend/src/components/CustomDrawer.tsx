import MuiDrawer from "@mui/material/Drawer";
import {styled} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import {CalendarMonth} from "@mui/icons-material";

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

/**
 * Drawer component.
 */
export const CustomDrawer = styled(MuiDrawer, {shouldForwardProp: (prop) => prop !== 'open'})(
    ({theme, open}) => ({
        '& .MuiDrawer-paper': {
            marginTop: '64px',
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