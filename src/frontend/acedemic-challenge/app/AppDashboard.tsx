import React from "react";

/**
 * Props of the Dashboard component.
 *
 * @property children the main content of the dashboard
 */
interface DashboardProps {
    children: React.ReactNode;
}

export default function AppDashboard({ children }: DashboardProps) {
    return (
        <div className="app-dashboard">
            {/*<div className=""></div>*/
                /* For dark purple AppBar*/}
            {children}
        </div>
    );
}
