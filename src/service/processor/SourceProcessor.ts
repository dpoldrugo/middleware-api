import {SinkIdentifier, SourceIdentifier, SourceProcessorResponse, SourceRequest} from "../../model/ProcessorModel";

export interface SourceProcessor {
    sourceIdentifier(): SourceIdentifier;
    sinkIdentifier(): SinkIdentifier;

    /**
     * Validate here the request and throw errors if the request is not valid
     * @param sourceRequest
     */
    validateRequest(sourceRequest: SourceRequest): void;
    process(sourceRequest: SourceRequest): Promise<SourceProcessorResponse>;
}


