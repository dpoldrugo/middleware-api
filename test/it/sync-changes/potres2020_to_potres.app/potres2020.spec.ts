'use strict';
import * as test_utils from "../../../test-utils/utils";
import * as chai from 'chai';
import {after, before, describe, it} from 'mocha';
import * as request from 'request';
import {RequestAPI} from 'request';
import {ApiServer} from '../../../../src/api-server';
import {MongoConnector} from "../../../../src/mongo-connector";
import {EntryStatus} from "../../../../src/service/processor/potres2020_to_potres.app/PotresAppModel";
import {
    CUSTOM_FIELD_LOCATION, POTRES2020_BASE_URL, POTRES2020_POSTS_API_ENDPOINT,
    POTRES_APP_BACKEND_BASE_URL
} from "../../../../src/service/processor/potres2020_to_potres.app/Config";
import {PotresAppIntegrationEndpoint} from "../../../../src/service/processor/potres2020_to_potres.app/Potres2020ChangesToPotresAppProcessor";
import {SourceIdentifier} from "../../../../src/model/ProcessorModel";

test_utils.initEnvFile();

const expect = chai.expect;
const nock = require('nock');

describe('/api/sync/changes', () => {

    let apiServer: ApiServer;
    let mongoConnector: MongoConnector;
    let apiRequest: RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;

    before(async () => {
        mongoConnector = new MongoConnector();
        await mongoConnector.connect();
        apiRequest = request.defaults({
            baseUrl: `http://localhost:${process.env.PORT}`,
            headers: {'Content-Type': 'application/json'}
        });
        if (process.env.NODE_ENV && process.env.NODE_ENV.includes('test')) {
            apiServer = new ApiServer();
            await apiServer.start();
            // tslint:disable-next-line:no-console
            console.info(`Started test ApiServer at port ${apiServer.PORT}`);
        }
    });

    after(async () => {
        await mongoConnector.disconnect();
        if (apiServer) {
            await apiServer.stop();
        }
    });

    describe('POST /potres2020', () => {

        beforeEach(() => {
            nock(POTRES2020_BASE_URL)
                .defaultReplyHeaders(defaultMockResponseHeaders)
                .post('/oauth/token')
                .reply(200, getTestJson('common','oauth-token-response.json'))
                .persist();
        });

        afterEach( () => {
            nock.cleanAll();
        });

        describe('with no IntegrationMetadata in potres2020', () => {
            const test = 'insert';
            const testPost = getTestPost(test);

            beforeEach( () => {
                mockExternalHttpResponses(test);
            });

            afterEach( () => {
                nock.cleanAll();
            });

            it('should insert a new entry to potres.app', (done) => {

                apiRequest.post({
                        body: JSON.stringify(testPost),
                        url: '/api/sync/changes/potres2020'
                    },
                    (error, response, body) => {
                        if (error !== null)
                            console.error(error);
                        verifyResponse(error, body, testPost, new VerificationParams({
                            entryContactName: 'Davor Poldrugo',
                            entryContactPhone: '+385921068955',
                            entryDone: false,
                            entryStatusInRequest: EntryStatus.novo,
                            entryStatusInResponse: EntryStatus.novo,
                            shouldCheckForNoCustomFieldMessage: false,
                            sinkResponseUrlToContain: '/data-api/integration-upsert-entry',
                            sourceIdentifier: 'potres2020'
                        }));
                        done();
                    });
            });
        });

        describe('with IntegrationMetadata in potres2020', () => {
            const test = 'update';
            const testPost = getTestPost(test);

            beforeEach( () => {
                mockExternalHttpResponses(test);
            });

            afterEach( () => {
                nock.cleanAll();
            });

            it('should update an entry in potres.app', (done) => {

                apiRequest.post({
                        body: JSON.stringify(testPost),
                        url: '/api/sync/changes/potres2020'
                    },
                    (error, response, body) => {
                        if (error !== null)
                            console.error(error);
                        verifyResponse(error, body, testPost, new VerificationParams({
                            entryContactName: 'Davor Poldrugo',
                            entryContactPhone: '+385921068955',
                            entryDone: true,
                            entryStatusInRequest: undefined,
                            entryStatusInResponse: EntryStatus.zavrseno,
                            shouldCheckForNoCustomFieldMessage: true,
                            sinkResponseUrlToContain: '/data-api/integration-upsert-entry',
                            sourceIdentifier: 'potres2020'
                        }));
                        done();
                    });
            });
        });

    });
});

function getTestJson(test: string, jsonFile: string) {
    return require(`./test-data/${test}/${jsonFile}`);
}

function getTestPost(test: string) {
    return getTestJson(test, 'potres2020-test-post.json');
}

class VerificationParams {
    public entryContactPhone: string;
    public entryContactName: string;
    public entryStatusInRequest: EntryStatus;
    public entryStatusInResponse: EntryStatus;
    public entryDone: boolean;
    public sinkResponseUrlToContain: string;
    public shouldCheckForNoCustomFieldMessage: boolean;
    public sourceIdentifier: SourceIdentifier;

    constructor(init: Partial<VerificationParams>) {
        Object.assign(this, init);
    }
}

function verifyResponse(error: any, body: any, testPost: any, verificationParams: VerificationParams) {
    expect(error).to.be.null;
    expect(body).to.not.be.null;
    const responseBody = JSON.parse(body);
    console.log("Received response:");
    console.log(JSON.stringify(responseBody, null, 2));
    expect(responseBody).to.not.be.null;
    expect(responseBody.sinkResults).to.not.be.null;
    expect(responseBody.sinkResults).to.length(1);
    const sinkResult = responseBody.sinkResults[0];
    if (sinkResult.error) {
        expect(sinkResult.error.message).to.be.null;
    }
    expect(sinkResult).to.contains({sourceIdentifier: 'potres2020', sinkIdentifier: 'potres.app'});
    expect(sinkResult.sourceRequest.url).to.eq('http://localhost/api/sync/changes/' + verificationParams.sourceIdentifier);

    expect(sinkResult.sinkRequest.data).not.to.be.null;
    expect(sinkResult.sinkRequest.data.data).not.to.be.null;

    expect(sinkResult.sinkRequest.data.data.status).to.eq(verificationParams.entryStatusInRequest);
    expect(sinkResult.sinkRequest.data.data.done).to.eq(verificationParams.entryDone);
    expect(sinkResult.sinkRequest.data.data.title).to.eq(testPost.title);
    expect(sinkResult.sinkRequest.data.data.contact_name).to.eq(verificationParams.entryContactName);
    expect(sinkResult.sinkRequest.data.data.contact_phone).to.eq(verificationParams.entryContactPhone);
    expect(sinkResult.sinkRequest.data.data.location).to.eq(`${testPost.values[CUSTOM_FIELD_LOCATION][0].lat},${testPost.values[CUSTOM_FIELD_LOCATION][0].lon}`);
    expect(sinkResult.sinkRequest.data.data.location_latitude).to.eq(testPost.values[CUSTOM_FIELD_LOCATION][0].lat);
    expect(sinkResult.sinkRequest.data.data.location_longitude).to.eq(testPost.values[CUSTOM_FIELD_LOCATION][0].lon);

    expect(sinkResult.sinkResponse.data.entry.status).to.eq(verificationParams.entryStatusInResponse);
    expect(sinkResult.sinkResponse.data.entry.done).to.eq(verificationParams.entryDone);
    expect(sinkResult.sinkResponse.data.entry.title).to.eq(testPost.title);
    expect(sinkResult.sinkResponse.data.entry.contact_name).to.eq(verificationParams.entryContactName);
    expect(sinkResult.sinkResponse.data.entry.contact_phone).to.eq(verificationParams.entryContactPhone);
    expect(sinkResult.sinkResponse.data.entry.location).to.eq(`${testPost.values[CUSTOM_FIELD_LOCATION][0].lat},${testPost.values[CUSTOM_FIELD_LOCATION][0].lon}`);
    expect(sinkResult.sinkResponse.data.entry.location_latitude).to.eq(testPost.values[CUSTOM_FIELD_LOCATION][0].lat);
    expect(sinkResult.sinkResponse.data.entry.location_longitude).to.eq(testPost.values[CUSTOM_FIELD_LOCATION][0].lon);

    expect(sinkResult.sinkRequest.data.data.integration).not.to.be.null;
    expect(sinkResult.sinkRequest.data.integration.original_id).to.eq(testPost.id);
    expect(sinkResult.sinkRequest.data.integration.name).to.eq('potres2020');

    expect(sinkResult.messages.join('|')).to.include('Got authorized response from');
    // expect(sinkResult.messages.join('|')).to.include('Potres2020 integration_metadata set to');
    expect(sinkResult.messages.join('|')).to.not.include('Error getting entry from potres.app based on IntegrationMetadata.original_id');
    if (verificationParams.shouldCheckForNoCustomFieldMessage)
        expect(sinkResult.messages.join('|')).to.not.include('No custom field for');

    expect(sinkResult.sinkResponse.url).to.include(verificationParams.sinkResponseUrlToContain);
}

const defaultMockResponseHeaders = {
    'Content-Type': 'application/json',
    'X-Powered-By': 'middleware-api-tests'
};

function mockExternalHttpResponses(test: string) {
    const testPost = getTestJson(test, 'potres2020-test-post.json');
    const testPostEndpoint = POTRES2020_POSTS_API_ENDPOINT + testPost.id;
    nock(POTRES2020_BASE_URL)
        .defaultReplyHeaders(defaultMockResponseHeaders)
        .get(testPostEndpoint)
        .reply(200, getTestJson(test, 'potres2020-get-test-post-authorized.json'));

    nock(POTRES_APP_BACKEND_BASE_URL)
        .defaultReplyHeaders(defaultMockResponseHeaders)
        .post(PotresAppIntegrationEndpoint.UPSERT)
        .reply(200, getTestJson(test, 'potres-app-integration-response.json'));

    nock(POTRES_APP_BACKEND_BASE_URL)
        .defaultReplyHeaders(defaultMockResponseHeaders)
        .get(/\/entries.*/)
        .reply(200, getTestJson(test, 'potres-app-integration-response.json').entry);

    nock(POTRES2020_BASE_URL)
        .defaultReplyHeaders(defaultMockResponseHeaders)
        .put(testPostEndpoint)
        .reply(200, getTestJson(test, 'potres2020-put-response.json'));
}