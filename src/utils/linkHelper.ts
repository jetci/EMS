/**
 * ดึง base path จาก global variable
 */
export const getBasePath = (): string => {
  return (window as any).__BASE_PATH__ || '';
};

/**
 * สร้าง absolute path ที่รวม base path
 * @example getFullPath('/news') => '/ems_staging/news'
 */
export const getFullPath = (path: string): string => {
  const base = getBasePath();
  
  // ถ้า path เริ่มด้วย / แล้ว ให้เอา base มาต่อหน้า
  if (path.startsWith('/')) {
    return base + path;
  }
  
  // ถ้าไม่มี / ให้เติม
  return base + '/' + path;
};

/**
 * Navigate ไปหน้าใหม่โดยใช้ base path
 */
export const navigateTo = (path: string): void => {
  window.location.href = getFullPath(path);
};
