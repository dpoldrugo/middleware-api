import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import validator from "validator";

type Potres2020WebhooksDocument = Potres2020Webhooks & mongoose.Document;

export interface Potres2020Webhooks {
    /**
     * SharedSecret which you defined in Ushahidi.
     * it will be used to calculate sha256
     * @type {string}
     */
    sharedSecret: string;
    /**
     * A valid url which you defined in Ushahidi
     * @type {string}
     */
    url: string;
}

const Potres2020WebhooksSchema = new mongoose.Schema({
    sharedSecret: {
        required: [true, 'sharedSecret is required'],
        type: String,
    },
    url: {
        required: [true, 'url is required and has to be unique'],
        type: String,
        unique: true,
        validate: [validator.isURL, "Not valid url!"],
    },
}, {timestamps: true});

const Potres2020WebhooksRepo: Model<Potres2020WebhooksDocument> = mongoose.model<Potres2020WebhooksDocument>('Potres2020Webhooks', Potres2020WebhooksSchema);
export default Potres2020WebhooksRepo;
