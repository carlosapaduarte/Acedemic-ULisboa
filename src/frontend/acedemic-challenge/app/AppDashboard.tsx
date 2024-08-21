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
        <div className="h-full w-full">
            <div className="bg-purple-dark flex h-1/4 w-full">{children}</div>
        </div>
    );
}
