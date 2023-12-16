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
 * Ute Router data items
 */
// export type RouterObjects<T = any[]> = {
//     [key in keyof Required<T>]: [];
// };
