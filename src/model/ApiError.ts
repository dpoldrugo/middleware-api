export class ApiError {
    public readonly error: string;
    public readonly code: number;

    constructor(message: string, code: number) {
        this.error = message;
        this.code = code;
    }
}