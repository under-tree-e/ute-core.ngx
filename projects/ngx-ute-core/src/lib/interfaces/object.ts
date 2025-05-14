/**
 * Ute Default Object
 */
export interface UteObjects<T = any> {
    [key: string | symbol | number]: T;
}

/**
 * Ute Interface Object
 */
export type InterfaceObject<T = any> = {
    [key in keyof Required<T>]: key;
};

/**
 * Error data interface
 *
 * @interface
 *
 * @prop {number} status - HTTP status code of the error @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * @prop {string} info - Error message
 */
export interface ErrorsData<T = any> extends Error {
    status: number;
    info: string;
}
