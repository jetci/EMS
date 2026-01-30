/**
 * RBAC Configuration for EMS WeCare
 * Role-based Access Control Permissions
 */

export type ViewScope = 'own' | 'all' | 'none';
export type ActionScope = 'own' | 'all' | 'none' | boolean;

export interface ModulePermission {
    view: ViewScope;
    create: boolean;
    edit: ActionScope;
    delete: ActionScope;
    [key: string]: any;
}

export interface RolePermissions {
    [module: string]: ModulePermission;
}

/**
 * Permission Definitions
 */
export const Permissions: Record<string, RolePermissions> = {
    // Community User Permissions
    community: {
        patient: {
            view: 'own',        // เฉพาะผู้ป่วยที่ตัวเองสร้าง
            create: true,       // สร้างได้
            edit: 'own',        // แก้ไขเฉพาะของตัวเอง
            delete: 'own',      // ลบเฉพาะของตัวเอง
            itemsPerPage: 5
        },
        ride: {
            view: 'own',        // เฉพาะ Rides ที่ตัวเองสร้าง
            create: true,       // สร้างได้
            edit: 'own',        // แก้ไขเฉพาะของตัวเอง
            delete: 'none',     // ลบไม่ได้
            assignDriver: false,
            cancel: false,
            rate: true,
            itemsPerPage: 5
        }
    },

    // Officer/Radio Center Permissions
    OFFICER: {
        patient: {
            view: 'all',        // ดูได้ทั้งหมด
            create: true,       // สร้างได้
            edit: 'all',        // แก้ไขได้ทั้งหมด
            delete: 'all',      // ลบได้ทั้งหมด
            itemsPerPage: 10
        },
        ride: {
            view: 'all',        // ดูได้ทั้งหมด
            create: false,      // สร้างไม่ได้
            edit: 'all',        // แก้ไขได้ทั้งหมด
            delete: 'none',     // ลบไม่ได้
            assignDriver: true, // มอบหมายคนขับได้
            cancel: true,       // ยกเลิกได้
            rate: false,
            itemsPerPage: 10
        }
    },

    // Admin Permissions
    admin: {
        patient: {
            view: 'all',
            create: true,
            edit: 'all',
            delete: 'all',
            itemsPerPage: 20
        },
        ride: {
            view: 'all',
            create: true,
            edit: 'all',
            delete: 'all',
            assignDriver: true,
            cancel: true,
            rate: false,
            itemsPerPage: 20
        }
    },

    // Executive Permissions (View Only)
    EXECUTIVE: {
        patient: {
            view: 'all',
            create: false,
            edit: 'none',
            delete: 'none',
            itemsPerPage: 20
        },
        ride: {
            view: 'all',
            create: false,
            edit: 'none',
            delete: 'none',
            assignDriver: false,
            cancel: false,
            rate: false,
            itemsPerPage: 20
        }
    }
};

/**
 * Get permissions for a specific role and module
 */
export const getPermissions = (role: string, module: string): ModulePermission => {
    const rolePerms = Permissions[role];
    if (!rolePerms) {
        console.warn(`No permissions found for role: ${role}`);
        return {
            view: 'none',
            create: false,
            edit: 'none',
            delete: 'none'
        };
    }

    const modulePerms = rolePerms[module];
    if (!modulePerms) {
        console.warn(`No permissions found for module: ${module} in role: ${role}`);
        return {
            view: 'none',
            create: false,
            edit: 'none',
            delete: 'none'
        };
    }

    return modulePerms;
};

/**
 * Check if user can perform an action on a resource
 */
export const canPerformAction = (
    permission: ActionScope,
    resourceOwnerId: string,
    currentUserId: string
): boolean => {
    if (permission === 'all' || permission === true) {
        return true;
    }

    if (permission === 'own') {
        return resourceOwnerId === currentUserId;
    }

    return false;
};

/**
 * Get data filter params based on view permission
 */
export const getDataFilterParams = (
    viewScope: ViewScope,
    userId: string
): Record<string, any> => {
    if (viewScope === 'own') {
        return { created_by: userId };
    }

    return {}; // 'all' or 'none'
};

export default Permissions;
