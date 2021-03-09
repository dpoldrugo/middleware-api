export type ProcessorIdentifier = string;
/**
 * The unique string identifier of the source of the changes.
 */
export type SourceIdentifier = string;
/**
 * The unique string identifier of the sink / destination where the changes will go.
 */
export type SinkIdentifier = string;
export type SourceProcessorResponseMessages = Array<string>;

/**
 * When a {@link SourceProcessor} processes the changes, it will result with this response.
 */
export class SourceProcessorResponse {
    /**
     * Identifier of the source system of changes
     * @type {SourceIdentifier}
     */
    public sourceIdentifier: SourceIdentifier;
    /**
     * Identifier of the sink (destination) system of changes
     * @type {SinkIdentifier}
     */
    public sinkIdentifier: SinkIdentifier;
    /**
     * All request data from the incoming request
     */
    public sourceRequest: ReqResData;
    /**
     * All request data that was sent to the sink (destination) system (backend).
     */
    public sinkRequest: ReqResData;
    /**
     * All response data that was received from the sink (destination) system (backend).
     */
    public sinkResponse: ReqResData;
    /**
     * During processing messages are appended here, for tracking what actually happened during processing.
     */
    public messages: Array<string>;
    /**
     * If there was an error during processing, it will be stored here.
     */
    public error: any;

    constructor(init: Partial<SourceProcessorResponse>) {
        Object.assign(this, init);
    }
}

/**
 * Holder for request/response data for source / sink systems.
 */
export class ReqResData {
    public url: string;
    public headers: any;
    public data: any;
    public statusCode: number;

    constructor(init: Partial<ReqResData>) {
        Object.assign(this, init);
    }
}