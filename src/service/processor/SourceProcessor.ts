import * as express from "express";
import {SinkIdentifier, SourceIdentifier, SourceProcessorResponse} from "../../model/ProcessorModel";

export interface SourceProcessor {
    sourceIdentifier(): SourceIdentifier;
    sinkIdentifier(): SinkIdentifier;

    /**
     * Validate here the request and throw errors if the request is not valid
     * @param sourceRequest
     */
    validateRequest(sourceRequest: express.Request): void;
    process(sourceRequest: express.Request): Promise<SourceProcessorResponse>;
}


