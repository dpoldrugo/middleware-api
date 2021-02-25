/**
 * All API errors are in this format.
 */
import {IsInt} from "typescript-rest-swagger";

export class ApiError {
    /**
     * Error message
     */
    public readonly error: string;
    /**
     * HTTP status code
     */
    @IsInt public readonly code: number;

    constructor(error: string, code: number) {
        this.error = error;
        this.code = code;
    }
}