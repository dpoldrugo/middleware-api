export class StatusResponse {
    /**
     * "OK" when app is running.
     * @type string
     */
    public readonly status: string;

    constructor(status: string) {
        this.status = status;
    }
}