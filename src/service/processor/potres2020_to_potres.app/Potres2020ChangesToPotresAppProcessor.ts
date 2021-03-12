import * as express from "express";
import {SourceProcessor} from "../SourceProcessor";
import {AxiosError, AxiosResponse} from "axios";
import { ReqResData, SinkIdentifier, SourceIdentifier, SourceProcessorResponse, SourceProcessorResponseMessages } from "../../../model/ProcessorModel";
import  * as PotresAppModel from "./PotresAppModel";
import validator from "validator";
import { findPhoneNumbersInText } from 'libphonenumber-js';
import {IsLong} from "typescript-rest-swagger";
import * as config from "./Config";
import {OnlyInstantiableByContainer, Singleton} from "typescript-ioc";
import {Errors} from "typescript-rest";
import {Entry} from "./PotresAppModel";
import * as context from "../../../service/context-utils";
import {POTRES2020_BASE_URL, POTRES2020_POSTS_API_ENDPOINT} from "./Config";

const mime = require('mime');
const axiosModule = require('axios');
const axios = axiosModule.create();
axios.interceptors.request.use(commonRequestHeadersInterceptor);

export const SOURCE_IDENTIFIER = 'potres2020';
export const SINK_IDENTIFIER = 'potres.app';
export const POTRES_APP_ENTRIES_PATH = '/entries/';

@OnlyInstantiableByContainer
@Singleton
export class Potres2020ChangesToPotresAppProcessor implements SourceProcessor {
    private potres2020OAuthTokenMetadata = new Potres2020OAuthTokenMetadata();
    // @Inject private checkSha256Util: CheckSha256Util; // TODO add sha256 validation - requires webhook_uuid to be stored in DB

    public sourceIdentifier(): SourceIdentifier { return SOURCE_IDENTIFIER;}
    public sinkIdentifier(): SinkIdentifier { return SINK_IDENTIFIER;}

    public validateRequest(sourceRequest: express.Request): void {
        if (!sourceRequest.body) {
            throw new Errors.BadRequestError("no payload present");
        }
        else if (!sourceRequest.body.id) {
            throw new Errors.BadRequestError("id not present in payload");
        }
    }

    public async process(sourceRequest: express.Request): Promise<SourceProcessorResponse> {
        const responseMessages = new Array<string>();
        responseMessages.push("Starting processing with Potres2020ChangesToPotresAppProcessor");
        if (sourceRequest.body.id < config.POTRES2020_CHANGES_TO_POTRES_APP_PROCESSOR_MIN_ID_TO_PROCESS) {
            responseMessages.push("Processing blocked by config - POTRES2020_CHANGES_TO_POTRES_APP_PROCESSOR_MIN_ID_TO_PROCESS=" + config.POTRES2020_CHANGES_TO_POTRES_APP_PROCESSOR_MIN_ID_TO_PROCESS);
            return this.buildResponse(sourceRequest, null, responseMessages);
        }
        const oAuthToken = await this.loginToPotres2020IfNeededAndGetOAuthToken(sourceRequest);
        const postApiUrl = POTRES2020_BASE_URL + POTRES2020_POSTS_API_ENDPOINT + sourceRequest.body.id;
        return await axios.get(postApiUrl, {
            headers: {
                Authorization: `${oAuthToken.token_type} ${oAuthToken.access_token}`,
            }
        }).then(async (responseWithFullData: AxiosResponse) => {
            const entry: PotresAppModel.Entry = this.transformToPotresAppModel(responseWithFullData, responseMessages);
            const integrationMetadata = this.getIntegrationMetadata(responseWithFullData, responseMessages);
            responseMessages.push(`Got authorized response from '${postApiUrl}'. IntegrationMetadata: ${JSON.stringify(integrationMetadata)}. access_token: ${process.env.NODE_ENV !== 'production' ? oAuthToken.access_token : '****'}`);

            let potresAppIntegrationEndpoint = PotresAppIntegrationEndpoint.INSERT;
            let entryFromBackend: Entry;
            // @ts-ignore
            if (integrationMetadata && integrationMetadata[this.sinkIdentifier()] && integrationMetadata[this.sinkIdentifier()].id !== null) {
                // @ts-ignore
                entryFromBackend = await axios.get<Entry>(config.POTRES_APP_BACKEND_BASE_URL + POTRES_APP_ENTRIES_PATH + integrationMetadata[this.sinkIdentifier()].original_id).then( (entryResponse: AxiosResponse<Entry>) => {
                        if (entryResponse.data.id) {
                            potresAppIntegrationEndpoint = PotresAppIntegrationEndpoint.UPDATE;
                        }
                        return entryResponse.data;
                    }
                ).catch((error: AxiosError) => {
                    // @ts-ignore
                    responseMessages.push(`Error getting entry from potres.app based on IntegrationMetadata.original_id: ${integrationMetadata[this.sinkIdentifier()].original_id}. Will insert a new entry!`);
                });
            }
            this.determineAndSetEntryStatus(entry, entryFromBackend, responseWithFullData, responseMessages);
            const integration: PotresAppModel.Integration = new PotresAppModel.Integration({name: this.sourceIdentifier(), original_id: responseWithFullData.data.id});
            const integrationRequest: PotresAppModel.IntegrationRequest = new PotresAppModel.IntegrationRequest({data: entry, integration: integration});
            const requestConfigPotresApp = {
                headers: {
                    Accept: mime.lookup('json'),
                    Authorization: 'App ' + config.POTRES_APP_API_KEY,
                    'Content-Type': mime.lookup('json'),
                }
            };
            // @ts-ignore
            return await axios.post<IntegrationResponse>(
                config.POTRES_APP_BACKEND_BASE_URL + potresAppIntegrationEndpoint,
                integrationRequest,
                requestConfigPotresApp)
                .then(async (responsePotresApp: AxiosResponse<PotresAppModel.IntegrationResponse>) => {
                    // don't update the existing potres2020 entry because it would cause again the webhook to be triggered
                    // const newValues = responseWithFullData.data.values;
                    // const newIntegrationMetadataValue: PotresAppModel.IntegrationMetadataValue = responsePotresApp.data.entry.integrations_data.potres2020;
                    // newIntegrationMetadataValue.original_id = responsePotresApp.data.entry.id;
                    // newValues[config.CUSTOM_FIELD_INTEGRATION_METADATA] = new Array(JSON.stringify(new PotresAppModel.IntegrationMetadataDefault(this.sinkIdentifier(), newIntegrationMetadataValue)));
                    //
                    // await axios.put(postApiUrl, {values: newValues},{
                    //     headers: {
                    //         Authorization: `${oAuthToken.token_type} ${oAuthToken.access_token}`,
                    //         'Content-Type': mime.lookup('json')
                    //     }
                    // })
                    //     .then((responseFromPotres2020: AxiosResponse) => {
                    //         responseMessages.push('Potres2020 integration_metadata set to: ' + JSON.stringify(newIntegrationMetadataValue));
                    //     })
                    //     .catch((error: AxiosError) => {
                    //         responseMessages.push("Error setting Potres2020 integration_metadata. Error: " + error.message);
                    //     });
                    return this.buildResponse(sourceRequest, responsePotresApp, responseMessages);
                })
                .catch((error: AxiosError) => {
                    return this.buildResponse(sourceRequest, error.response, responseMessages, error);
                });
        }).catch((error: AxiosError) => {
            return this.buildResponse(sourceRequest, error.response, responseMessages, error);
        });

    }

    private async loginToPotres2020IfNeededAndGetOAuthToken(sourceRequest: express.Request): Promise<OAuthToken> {
        if (this.potres2020OAuthTokenMetadata.isValid())
            return this.potres2020OAuthTokenMetadata.oAuthToken;

        const data = {
            client_id: config.POTRES2020_CLIENT_ID,
            client_secret: config.POTRES2020_CLIENT_SECRET,
            grant_type: "password",
            password: config.POTRES2020_PASSWORD,
            scope: "*",
            username: config.POTRES2020_USERNAME
        };
        const requestConfig = {
            data: data,
            headers: {
                'Content-Type': mime.lookup('json')
            },
            method: 'post',
            url: `${POTRES2020_BASE_URL}/oauth/token`
        };

        const oAuthToken: OAuthToken = await axios(requestConfig)
            .then(function (response: AxiosResponse) {
                return response.data;
            })
            .catch(function (error: AxiosError) {
                console.log(error);
            });

        if (oAuthToken)
            this.potres2020OAuthTokenMetadata.initToken(oAuthToken);

        return oAuthToken;
    }

    private buildResponse(sourceRequest: express.Request, sinkResponse: AxiosResponse, responseMessages: SourceProcessorResponseMessages, error?: any): SourceProcessorResponse {
        const response = new SourceProcessorResponse({
            processorRunId: context.getProcessorRunId(),
            sinkIdentifier: this.sinkIdentifier(),
            sourceIdentifier: this.sourceIdentifier(),
            sourceRequest: new ReqResData({
                data: sourceRequest.body,
                headers: sourceRequest.headers,
                url: sourceRequest.protocol + '://' + sourceRequest.get('host') + sourceRequest.originalUrl
            }),
            // tslint:disable-next-line:object-literal-sort-keys
            sinkRequest: new ReqResData({
                data: sinkResponse && sinkResponse.config.data && validator.isJSON(sinkResponse.config.data) ? JSON.parse(sinkResponse.config.data) : (sinkResponse && sinkResponse.config ? sinkResponse.config.data : null),
                headers: sinkResponse ? sinkResponse.config.headers : null,
                url: sinkResponse ? sinkResponse.config.url : null
            }),
            sinkResponse: new ReqResData({
                data: sinkResponse ? sinkResponse.data : null,
                headers: sinkResponse ? sinkResponse.headers : null,
                statusCode: sinkResponse ? sinkResponse.status : null,
                url: sinkResponse ? sinkResponse.config.url : null
            }),
            messages: responseMessages
        });
        if (error) {
            if (error.response && error.response.data)
                response.error = error.response.data;
            else
                response.error = error;
        }
        return response;
    }

    private transformToPotresAppModel(responseWithFullData: AxiosResponse, responseMessages: SourceProcessorResponseMessages): PotresAppModel.Entry {
        const contact = this.getValueOfCustomField(responseWithFullData, config.CUSTOM_FIELD_CONTACT, responseMessages) as string;
        let contactName = null;
        if (contact)
            contactName = validator.blacklist( contact.replace(validator.whitelist(contact, '+0123456789'), ''), '\\.\\,\\-\\_').trim();
        const detailDescription = this.getValueOfCustomField(responseWithFullData, config.CUSTOM_FIELD_DETAIL_DESCRIPTION, responseMessages);
        const notes = this.getValueOfCustomField(responseWithFullData, config.CUSTOM_FIELD_NOTES, responseMessages);
        const content = responseWithFullData.data.content; // kratki opis
        const textForNumberSearch = contact + '\n' + detailDescription + '\n' + content + '\n' + notes;
        const foundNumbers = findPhoneNumbersInText(textForNumberSearch, 'HR');
        let phone = foundNumbers.length > 0 ? foundNumbers[0].number.number.toString() : '';
        if (phone && !contactName) {
            contactName = phone;
        }
        if (!phone) phone = 'nepoznat';
        if (!contactName) contactName = 'nepoznat';

        const entry = new PotresAppModel.Entry({
            contact_name: contactName,
            contact_phone: phone,
            description: buildDescription(content, detailDescription),
            done: config.Potres2020ToPotresAppDoneMapping.filter(value => value.key === responseWithFullData.data.status)[0].value,
            notes: notes,
            title: responseWithFullData.data.title
        });
        const locationCustomField = this.getValueOfCustomField(responseWithFullData, config.CUSTOM_FIELD_LOCATION, responseMessages);
        if (locationCustomField) {
            entry.location = `${locationCustomField.lat},${locationCustomField.lon}`;
            entry.location_latitude = locationCustomField.lat;
            entry.location_longitude = locationCustomField.lon;
        }
        else
            entry.location = 'nepoznato';

        return entry;

        function buildDescription(pContent: string, pDetailDescription: string): string {
            return (
`Kratki opis:
${pContent}

Detaljniji opis:
${pDetailDescription}`);
        }
    }

    private determineAndSetEntryStatus(entry: PotresAppModel.Entry,
                                       entryFromBackend: PotresAppModel.Entry,
                                       responseWithFullData: AxiosResponse,
                                       responseMessages: SourceProcessorResponseMessages) {
        if (entryFromBackend && entryFromBackend.status && entryFromBackend.status.trim() !== '') {
            responseMessages.push(`Existing Entry in potres.app already has status. Will not change it! Entry.status=${entryFromBackend.status}, potres2020.status=${responseWithFullData.data.status}`);
            return;
        }
        const potres2020Status = responseWithFullData.data.status;
        const entryStatus: PotresAppModel.EntryStatus = config.Potres2020ToPotresAppStatusMapping.filter(value => value.key === potres2020Status)[0].value;
        entry.status = entryStatus;
    }

    private getValueOfCustomField(response: AxiosResponse<any>, fieldKey: string, responseMessages: SourceProcessorResponseMessages): any {
        const value = response.data.values[fieldKey];
        if (!value) {
            responseMessages.push("No custom field for: " + fieldKey);
        }
        return value ? value[0] : null;
    }

    private getIntegrationMetadata(responseWithFullData: AxiosResponse, responseMessages: SourceProcessorResponseMessages): PotresAppModel.IntegrationMetadata {
        const integrationMetadataRaw = this.getValueOfCustomField(responseWithFullData, config.CUSTOM_FIELD_INTEGRATION_METADATA, responseMessages);
        if (integrationMetadataRaw) {
            return JSON.parse(integrationMetadataRaw) as PotresAppModel.IntegrationMetadata;
        }
        return null;
    }
}

function commonRequestHeadersInterceptor(request: express.Request) {
    request.headers['X-Request-Id'] = context.getRequestId();
    request.headers['X-Processor-Run-Id'] = context.getProcessorRunId();
    return request;
}


class Potres2020OAuthTokenMetadata{
    public oAuthToken: OAuthToken;
    private validUntil: Date;

    public initToken(oAuthToken: OAuthToken) {
        this.oAuthToken = oAuthToken;
        this.validUntil = new Date(Date.now() + oAuthToken.expires_in*1000);
    }

    public isValid(): boolean {
        if (!this.oAuthToken)
            return false;
        if (Date.now() < this.validUntil.getMilliseconds()) {
            return true;
        }
        return false;
    }
}

class OAuthToken {
    // tslint:disable-next-line:variable-name
    public token_type: String;
    // tslint:disable-next-line:variable-name
    @IsLong public expires_in: number;
    // tslint:disable-next-line:variable-name
    public access_token: String;
    // tslint:disable-next-line:variable-name
    public refresh_token: String;
}

enum PotresAppIntegrationEndpoint {
    INSERT = '/data-api/integration-add-entry',
    UPDATE = '/data-api/integration-update-entry'
}




