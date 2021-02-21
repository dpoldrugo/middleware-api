// Immutable data object
export class CheckSha256Request {
    /**
     * The sha calculated on the Ushahidi side.
     * @type {string}
     */
    public readonly sha256Request: string;
    /**
     * The url of the webhook defined in Ushahidi
     * @type {string} url
     */
    public readonly webhookUrl: string;
    /**
     * Whole json of the payload received from Ushahidi to your {@link webhookUrl}.
     */
    public readonly payload: string;

    constructor(sha256Request: string, webhookUrl: string, payload: string) {
        this.sha256Request = sha256Request;
        this.webhookUrl = webhookUrl;
        this.payload = payload;
    }
}