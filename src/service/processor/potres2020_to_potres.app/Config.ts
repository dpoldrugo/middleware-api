import {EntryStatus} from "./PotresAppModel";
const dotenv = require('dotenv');
const fs = require('fs');

let config: any = process.env;
if (process.env.NODE_ENV && process.env.NODE_ENV.includes('test')) {
    config = dotenv.parse(fs.readFileSync(`./.env.${process.env.NODE_ENV}`));
}
export const POTRES_APP_BACKEND_BASE_URL = config.POTRES_APP_BACKEND_BASE_URL || 'http://localhost:1337';
export const POTRES_APP_API_KEY = config.POTRES_APP_API_KEY || 'davor-dev-token-fdsfdsfldjfddkgfgdf';

export const POTRES2020_USERNAME = config.POTRES2020_USERNAME;
export const POTRES2020_PASSWORD = config.POTRES2020_PASSWORD;
export const POTRES2020_CLIENT_ID = config.POTRES2020_CLIENT_ID;
export const POTRES2020_CLIENT_SECRET = config.POTRES2020_CLIENT_SECRET;

export const CUSTOM_FIELD_INTEGRATION_METADATA = config.CUSTOM_FIELD_INTEGRATION_METADATA || '35560aa7-b4a4-4ac5-a5ef-0d280b21b48b'; // integration_metadata
export const CUSTOM_FIELD_LOCATION = config.CUSTOM_FIELD_LOCATION || '87e86d94-df5d-4eb5-9080-5a4d44a5f769'; // lokacija
export const CUSTOM_FIELD_CONTACT = config.CUSTOM_FIELD_CONTACT || '4583d2a1-331a-4da2-86df-3391e152198e'; // kontakt
export const CUSTOM_FIELD_DETAIL_DESCRIPTION = config.CUSTOM_FIELD_DETAIL_DESCRIPTION || '3c8441b3-5744-48bb-9d9e-d6ec4be50613'; // detaljniji opis
export const CUSTOM_FIELD_NOTES = config.CUSTOM_FIELD_NOTES || '6b541a6d-eb02-4824-8662-a741da46b2b3'; // zaključak

export const POTRES2020_CHANGES_TO_POTRES_APP_PROCESSOR_MIN_ID_TO_PROCESS = +config.POTRES2020_CHANGES_TO_POTRES_APP_PROCESSOR_MIN_ID_TO_PROCESS || 0;

enum Potres2020Status {
    published = 'published',
    draft = 'draft',
    archived = 'archived'
}
class KeyValue<K,V> {
    public key: K;
    public value: V;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }
}

export const Potres2020ToPotresAppStatusMapping: Array<KeyValue<Potres2020Status, EntryStatus>> = new Array<KeyValue<Potres2020Status, EntryStatus>>();
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.published, EntryStatus.novo));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.published, EntryStatus.preuzeto));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.published,EntryStatus.parcijalno_rijeseno));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.published, EntryStatus.provjereno));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.published, EntryStatus.rizicno_opasno));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.published, EntryStatus.treba_ponoviti));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.archived, EntryStatus.zavrseno));
Potres2020ToPotresAppStatusMapping.push(new KeyValue(Potres2020Status.draft, EntryStatus.novo));

export const Potres2020ToPotresAppDoneMapping: Array<KeyValue<Potres2020Status, boolean>> = new Array<KeyValue<Potres2020Status, boolean>>();
Potres2020ToPotresAppDoneMapping.push(new KeyValue(Potres2020Status.published, false));
Potres2020ToPotresAppDoneMapping.push(new KeyValue(Potres2020Status.draft, false));
Potres2020ToPotresAppDoneMapping.push(new KeyValue(Potres2020Status.archived, true));

