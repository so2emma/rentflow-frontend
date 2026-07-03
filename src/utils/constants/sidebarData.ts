export type NavItem = {
    id: string;
    label: string;
    icon: string
    isTenant: boolean;
};
export type NavItemType = { navMain: NavItem[] }
export const sidebarData: NavItemType = {
    navMain: [
        { id: 'dashboard', label: 'My Dashboard', icon: 'dashboard', isTenant: true},
        { id: 'lease', label: 'Lease Details', icon: 'description', isTenant: true },
        { id: 'history', label: 'Payment History', icon: 'receipt_long', isTenant: true},
        { id: 'maintenance', label: 'Maintenance', icon: 'build', isTenant: true},
    ],
}
