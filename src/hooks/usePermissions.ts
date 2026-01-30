/**
 * usePermissions Hook
 * Custom hook for accessing role-based permissions
 */

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPermissions, canPerformAction, getDataFilterParams, ModulePermission } from '../config/permissions';

interface UsePermissionsResult extends ModulePermission {
    canEdit: (resourceOwnerId: string) => boolean;
    canDelete: (resourceOwnerId: string) => boolean;
    getFilterParams: () => Record<string, any>;
}

/**
 * Hook to get permissions for a specific module
 * @param module - Module name (e.g., 'patient', 'ride')
 * @returns Permissions object with helper functions
 */
export const usePermissions = (module: string): UsePermissionsResult => {
    const { user } = useAuth();

    const permissions = useMemo(() => {
        if (!user) {
            return {
                view: 'none' as const,
                create: false,
                edit: 'none' as const,
                delete: 'none' as const
            };
        }

        return getPermissions(user.role, module);
    }, [user, module]);

    const canEdit = (resourceOwnerId: string): boolean => {
        if (!user) return false;
        return canPerformAction(permissions.edit, resourceOwnerId, user.id);
    };

    const canDelete = (resourceOwnerId: string): boolean => {
        if (!user) return false;
        return canPerformAction(permissions.delete, resourceOwnerId, user.id);
    };

    const getFilterParams = (): Record<string, any> => {
        if (!user) return {};
        return getDataFilterParams(permissions.view, user.id);
    };

    return {
        ...permissions,
        canEdit,
        canDelete,
        getFilterParams
    };
};

export default usePermissions;
