import * as mongoose from 'mongoose';
import {Model, Schema} from 'mongoose';
import {SourceProcessorResponse} from "./ProcessorModel";

type SourceProcessorResponseLogDocument = SourceProcessorResponseLog & mongoose.Document;

export class SourceProcessorResponseLog {
    public env: string;
    public ip: string;
    public requestId: string;
    public processorRunId: string;
    public response: SourceProcessorResponse;
    public sinkIdentifier: string;
    public sourceIdentifier: string;

    constructor(init: Partial<SourceProcessorResponseLog>) {
        Object.assign(this, init);
    }
}

const SourceProcessorResponseLogSchema = new mongoose.Schema({
    env: {
        type: String,
    },
    ip: {
        required: [true, 'ip is required'],
        type: String,
    },
    requestId: {
        required: [true, 'requestId is required'],
        type: String,
    },
    // tslint:disable-next-line:object-literal-sort-keys
    processorRunId: {
        required: [true, 'processorRunId is required'],
        type: String,
    },
    sinkIdentifier: {
        required: [true, 'sinkIdentifier is required'],
        type: String,
    },
    sourceIdentifier: {
        required: [true, 'sourceIdentifier is required'],
        type: String,
    },
    // tslint:disable-next-line:object-literal-sort-keys
    response: {
        required: [true, 'response is required'],
        type: Schema.Types.Mixed
    },
}, {timestamps: true});

const SourceProcessorResponseLogRepo: Model<SourceProcessorResponseLogDocument> = mongoose.model<SourceProcessorResponseLogDocument>('processor_log', SourceProcessorResponseLogSchema);
export default SourceProcessorResponseLogRepo;
