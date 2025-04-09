/**
 * Options for Ute HttpService
 * @prop {@link HttpOptions.db | db}?: `string` - Custom DB name
 * @prop {@link HttpOptions.auth | auth}?: `string` - Authorization header string
 * @prop {@link HttpOptions.online | online}?: `boolean` - Request direct to online db
 * @prop {@link HttpOptions.global | global}?: `boolean` - Request direct to global server
 * @prop {@link HttpOptions.headers | headers}?: `CustomHeaderData` - Custom header for request
 */
export interface HttpOptions {
    /**
     * Custom DB name
     */
    db?: string;
    /**
     * Authorization header string
     */
    auth?: string;
    /**
     * Request direct to online db
     */
    online?: boolean;
    /**
     * Request direct to global server
     */
    global?: boolean;
    /**
     * Custom header for request
     */
    headers?: CustomHeaderData[];
    multipart?: boolean;
}

/**
 * Custom header for request
 */
export interface CustomHeaderData {
    [name: string]: string;
}
