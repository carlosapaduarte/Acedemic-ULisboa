import {Box, CircularProgress, Typography} from "@mui/material";

/**
 * Properties for the LoadingSpinner component.
 *
 * @property text the text to be shown below the spinner
 */
interface LoadingSpinnerProps {
    text?: string
}

/**
 * A loading spinner that rotates infinitely.
 * Useful for indicating that a process is running.
 */
export default function LoadingSpinner({text}: LoadingSpinnerProps) {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <CircularProgress/>
            {text && <Typography variant="h6">{text}</Typography>}
        </Box>
    )
}