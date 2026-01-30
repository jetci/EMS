/**
 * Case Converter Utility
 * Converts between snake_case and camelCase
 * 
 * Used to transform database responses (snake_case) to API responses (camelCase)
 * for better JavaScript/TypeScript convention compliance
 */

/**
 * Convert snake_case string to camelCase
 * @param str - String in snake_case format
 * @returns String in camelCase format
 * 
 * @example
 * snakeToCamelString('user_name') // returns 'userName'
 * snakeToCamelString('patient_id') // returns 'patientId'
 */
export const snakeToCamelString = (str: string): string => {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase string to snake_case
 * @param str - String in camelCase format
 * @returns String in snake_case format
 * 
 * @example
 * camelToSnakeString('userName') // returns 'user_name'
 * camelToSnakeString('patientId') // returns 'patient_id'
 */
export const camelToSnakeString = (str: string): string => {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Convert object keys from snake_case to camelCase (recursive)
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 * 
 * @example
 * snakeToCamel({ user_name: 'John', patient_id: '123' })
 * // returns { userName: 'John', patientId: '123' }
 */
export const snakeToCamel = <T = any>(obj: any): T => {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => snakeToCamel(item)) as any;
    }

    // Handle objects
    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = snakeToCamelString(key);
            acc[camelKey] = snakeToCamel(obj[key]);
            return acc;
        }, {} as any);
    }

    // Handle primitives (string, number, boolean, etc.)
    return obj;
};

/**
 * Convert object keys from camelCase to snake_case (recursive)
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 * 
 * @example
 * camelToSnake({ userName: 'John', patientId: '123' })
 * // returns { user_name: 'John', patient_id: '123' }
 */
export const camelToSnake = <T = any>(obj: any): T => {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => camelToSnake(item)) as any;
    }

    // Handle objects
    if (typeof obj === 'object' && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = camelToSnakeString(key);
            acc[snakeKey] = camelToSnake(obj[key]);
            return acc;
        }, {} as any);
    }

    // Handle primitives
    return obj;
};

/**
 * Middleware helper: Transform response to camelCase
 * Use this in Express routes to automatically transform responses
 * 
 * @example
 * router.get('/patients/:id', async (req, res) => {
 *   const patient = db.get('SELECT * FROM patients WHERE id = ?', [id]);
 *   res.json(transformResponse(patient));
 * });
 */
export const transformResponse = <T = any>(data: any): T => {
    return snakeToCamel<T>(data);
};

/**
 * Middleware helper: Transform request body to snake_case
 * Use this to transform incoming camelCase data to snake_case for database
 * 
 * @example
 * router.post('/patients', (req, res) => {
 *   const dbData = transformRequest(req.body);
 *   db.insert('patients', dbData);
 * });
 */
export const transformRequest = <T = any>(data: any): T => {
    return camelToSnake<T>(data);
};
