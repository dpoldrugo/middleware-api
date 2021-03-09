import {SourceProcessorResponse} from "../model/ProcessorModel";

/**
 * Holder for all {@link SourceProcessor} responses ({@link SourceProcessorResponse}.
 */
export class SyncChangesResponse {
    public readonly sinkResults: Array<SourceProcessorResponse> = new Array<SourceProcessorResponse>();

    public addResult(sourceProcessorResponse: SourceProcessorResponse) {
        this.sinkResults.push(sourceProcessorResponse);
    }

}