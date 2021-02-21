// Immutable data object
export class CheckSha256Response {
    public readonly valid: boolean;

    constructor(valid: boolean) {
        this.valid = valid;
    }
}