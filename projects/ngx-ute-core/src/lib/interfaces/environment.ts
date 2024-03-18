/**
 * Additional parameters for Angular environment
 * @prop {@link UteEnvironment.online | online}?: `boolean` - App online status
 * @prop {@link UteEnvironment.platform | platform}?: `string` - Platform on app starts
 * @prop {@link UteEnvironment.server | server}?: `string` - Server url
 * @prop {@link UteEnvironment.production | production}?: `boolean` - App production status
 * @prop {@link UteEnvironment.storage | storage}?: `any` - Variable of local storage
 * @prop {@link UteEnvironment.defLocale | defLocale}?: `string` - Default locale
 * @prop {@link UteEnvironment.localeList | localeList}?: `string[]` - List of available locales
 * @prop {@link UteEnvironment.authToken | authToken}?: `string` - User auth token for Bearer Authorization
 * @prop {@link UteEnvironment.apiToken | apiToken}?: `string` - App api token for Bearer API Authorization
 */
export interface UteEnvironment {
    /**
     * App online status
     */
    online?: boolean;
    /**
     * Platform on app starts (`web`, `ionic`, `electron`)
     */
    platform?: string;
    /**
     * Server url
     */
    server?: string;
    /**
     * App production status
     */
    production?: boolean;
    /**
     * Variable of local storage
     */
    storage?: any;
    /**
     * Default locale
     */
    defLocale?: string;
    /**
     * List of available locales
     */
    localeList?: string[];
    /**
     * User auth token for Bearer Authorization
     */
    authToken?: string;
    /**
     * App api token for Bearer API Authorization
     */
    apiToken?: string;
}
