import {SourceProcessorResponse} from "../model/ProcessorModel";
import SourceProcessorResponseLogRepo, {SourceProcessorResponseLog} from "./SourceProcessorResponseLogDocument";
import {generateId} from "../service/utils";
/**
 * Holder for all {@link SourceProcessor} responses ({@link SourceProcessorResponse}.
 */
export class SyncChangesResponse {
    public ip: string;
    public readonly requestId: string;
    public readonly sinkResults: Array<SourceProcessorResponse> = new Array<SourceProcessorResponse>();

    constructor(ip: string, requestId: string) {
        this.ip = ip;
        this.requestId = requestId;
    }

    public addResult(sourceProcessorResponse: SourceProcessorResponse) {
        this.sinkResults.push(sourceProcessorResponse);
    }

    public saveResultsToDb() {
        this.sinkResults.forEach(value => SourceProcessorResponseLogRepo.create(new SourceProcessorResponseLog({
            env: process.env.NODE_ENV,
            ip: this.ip,
            processorRunId: value.processorRunId,
            requestId: this.requestId,
            response: value,
            sinkIdentifier: value.sinkIdentifier,
            sourceIdentifier: value.sourceIdentifier
        })));

    }

}