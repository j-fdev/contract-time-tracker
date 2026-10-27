import { useOutletContext } from 'react-router-dom';

import type { NotificationMessage } from '../components/Notification';
import type { Project } from '../types/project';
import type { Punch } from '../types/punch';
import type { User } from '../types/user';

/** Data the dashboard loads once and shares with its tabs (punch card, projects, clients). */
export interface DashboardContext {
    projects: Project[];
    users: User[];
    punches: Punch[];
    selectedProject: Project | null;
    reloadPunches: () => Promise<void>;
    reloadProjects: () => Promise<void>;
    reloadUsers: () => Promise<void>;
    notify: (notification: NotificationMessage) => void;
}

export function useDashboard(): DashboardContext {
    return useOutletContext<DashboardContext>();
}
