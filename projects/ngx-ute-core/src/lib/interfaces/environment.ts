/**
 * Additional parameters for Angular environment
 * @prop {@link UteEnvironment.online | online}?: `boolean` - App online status
 * @prop {@link UteEnvironment.platform | platform}?: `string` - Platform on app starts
 * @prop {@link Uteenvironment.appServer | server}?: `string` - Server url
 * @prop {@link UteEnvironment.production | production}?: `boolean` - App production status
 * @prop {@link UteEnvironment.storage | storage}?: `any` - Variable of local storage
 * @prop {@link UteEnvironment.defLocale | defLocale}?: `string` - Default locale
 * @prop {@link UteEnvironment.localeList | localeList}?: `string[]` - List of available locales
 * @prop {@link UteEnvironment.authToken | authToken}?: `string` - User auth token for Bearer Authorization
 * @prop {@link UteEnvironment.apiToken | apiToken}?: `string` - App api token for Bearer API Authorization
 * @prop {@link UteEnvironment.ssr | ssr}?: `boolean` - SSR Angular activation
 * @prop {@link UteEnvironment.appId | appId}?: `string` - Application ID
 * @prop {@link UteEnvironment.gtag | gtag}?: `string` - Google Analytics ID
 * @prop {@link UteEnvironment.globalServer | globalServer}?: `string` - Global Server url
 */
export interface UteEnvironment {
    /**
     * Server app online status
     */
    online?: boolean;
    /**
     * Mobile screen size status
     */
    mobile?: boolean;
    /**
     * Platform on app starts (`web`, `ionic`, `electron`)
     */
    platform?: string;
    /**
     * Operation System Name;
     */
    os?: string;
    /**
     * Application ID
     * @template "com.domain.app"
     */
    appId?: string;
    /**
     * Application Server url
     */
    appServer?: string;
    /**
     * Global Server url (user & auth)
     */
    globalServer?: string;
    /**
     * App production status
     */
    production: boolean;
    /**
     * Variable of local storage
     */
    storage?: any;
    /**
     * Default locale
     */
    defLocale: string;
    /**
     * List of available locales
     */
    localeList: string[];
    /**
     * User session data
     */
    session: any;
    /**
     * App api token for Bearer API Authorization
     */
    apiToken?: string;
    /**
     * SSR Angular activation
     */
    ssr?: boolean;
    /**
     * Google Analytics ID
     */
    gtag?: string;
}
