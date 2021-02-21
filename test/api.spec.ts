'use strict';
import * as test_utils from "./test-utils/utils";
test_utils.initEnvFile();
import * as chai from 'chai';
import {after, before, describe, it} from 'mocha';
import * as request from 'request';
import {RequestAPI} from 'request';
import {HttpMethod, Server} from 'typescript-rest';
import {ApiServer} from '../src/api-server';
import {MongoConnector} from "../src/mongo-connector";
import Potres2020WebhooksRepo, {Potres2020Webhooks} from "../src/model/Potres2020WebhooksDocument";
import {CheckSha256Request} from "../src/model/CheckSha256Request";
import {ApiError} from "../src/model/ApiError";

describe('API Tests', () => {

    const expect = chai.expect;
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
        if (process.env.NODE_ENV === 'test') {
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

    describe('The Rest Server', () => {
        it('should provide a catalog containing the exposed paths', () => {
            if (process.env.NODE_ENV !== 'test') {
                // can't check this when no test ApiServer started
                return;
            }

            expect(Server.getPaths()).to.include.members([
                '/api/status',
                '/api/potres2020/utils/checkSha256',
                '/api/potres2020/webhooks',
            ]);
            expect(Server.getHttpMethods('/api/status')).to.have.members([HttpMethod.GET]);
            expect(Server.getHttpMethods('/api/potres2020/utils/checkSha256')).to.have.members([HttpMethod.POST]);
            expect(Server.getHttpMethods('/api/potres2020/webhooks')).to.have.members([HttpMethod.POST]);
        });
    });

    describe('POST /api/potres2020/utils/checkSha256', () => {

        const testWebhook: Potres2020Webhooks = {
            sharedSecret: 'test-shared-secret',
            url: 'https://test-webhook-url.com'
        } as Potres2020Webhooks;

        before(async () => {
            await Potres2020WebhooksRepo.create(testWebhook);
        });

        after(async () => {
            await Potres2020WebhooksRepo.deleteOne(testWebhook);
        });

        describe("with correct sha256, webhookUrl and payload", () => {
            it('should get {valid: true}', (done) => {
                apiRequest.post({
                    body: JSON.stringify({
                        payload: '{"id":915, "form_id":5}',
                        sha256Request: '0IKKTG9u3lNxSx+s06Huf5BI6xvzUWo0XrvqvW3LXaE=',
                        webhookUrl: 'https://test-webhook-url.com'
                    }),
                    url: '/api/potres2020/utils/checkSha256'

                }, (error, response, body) => {
                    expect(error).to.eq(null);
                    expect(body).to.eq(JSON.stringify({valid: true}));
                    expect(response.statusCode).to.eq(200);
                    done();
                });
            });
        });
        describe("with wrong sha256, webhookUrl or payload", () => {
            it('should get {valid: false}', (done) => {
                apiRequest.post({
                    body: JSON.stringify({
                        payload: '{"id":915, "form_id":5, "tampered": "data"}',
                        sha256Request: '0IKKTG9u3lNxSx+s06Huf5BI6xvzUWo0XrvqvW3LXaE=',
                        webhookUrl: 'https://test-webhook-url.com'
                    }),
                    url: '/api/potres2020/utils/checkSha256'

                }, (error, response, body) => {
                    expect(error).to.eq(null);
                    expect(body).to.eq(JSON.stringify({valid: false}));
                    expect(response.statusCode).to.eq(200);
                    done();
                });
            });
        });

        describe("with webhook not defined in DB", () => {
            it('should get ApiError with message: Webhook not defined! Webhook: ... ', (done) => {
                apiRequest.post({
                    body: JSON.stringify({
                        payload: '{"id":915, "form_id":5, "tampered": "data"}',
                        sha256Request: '0IKKTG9u3lNxSx+s06Huf5BI6xvzUWo0XrvqvW3LXaE=',
                        webhookUrl: 'https://WRONG-WEBHOOK-URL.COM'
                    }),
                    url: '/api/potres2020/utils/checkSha256'

                }, (error, response, body) => {
                    expect(error).to.eq(null);
                    const expectedError: ApiError = new ApiError("Webhook not defined! Webhook: https://WRONG-WEBHOOK-URL.COM", 400);
                    const responseJson = JSON.parse(body);
                    expect(responseJson).to.contains(expectedError);

                    expect(response.statusCode).to.eq(expectedError.code);
                    done();
                });
            });
        });

        describe("when using CheckSha256Request model", () => {
            it('should get response', (done) => {
                apiRequest.post({
                    body: JSON.stringify(new CheckSha256Request('0IKKTG9u3lNxSx+s06Huf5BI6xvzUWo0XrvqvW3LXaE=', 'https://test-webhook-url.com', '{"id":915, "form_id":5, "tampered": "data"}')),
                    url: '/api/potres2020/utils/checkSha256'

                }, (error, response, body) => {
                    expect(error).to.eq(null);
                    expect(body).to.eq(JSON.stringify({valid: false}));
                    expect(response.statusCode).to.eq(200);
                    done();
                });
            });
        });
    });

    describe('POST /api/potres2020/webhooks', () => {

        const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiRGF2b3IgUG9sZHJ1Z28ifQ.GQQLbT5AUowrdiaYlVB_8HMhSWT1utp5vEb4Ggdsh40';

        describe('with correct Authorization header', () => {

            const webhookUrlToCreate =
                {
                    sharedSecret: 'test-create',
                    url: 'https://test-create-webhook-url.com'
                };

            after(async () => {
                await Potres2020WebhooksRepo.deleteOne(webhookUrlToCreate);
            });

            it('should be inserted into DB', (done) => {

                apiRequest.post({
                    body: JSON.stringify(webhookUrlToCreate),
                    headers: {'Authorization': 'Bearer ' + JWT_TOKEN},
                    url: '/api/potres2020/webhooks'

                }, async (error, response, body) => {
                    expect(error).to.eq(null);

                    const responseJson = JSON.parse(body);
                    expect(responseJson.url).to.eq(webhookUrlToCreate.url);
                    expect(responseJson.sharedSecret).to.eq(webhookUrlToCreate.sharedSecret);
                    expect(responseJson.__v).to.be.an("number");
                    expect(responseJson._id).to.be.an("string");
                    expect(responseJson.createdAt).to.be.an("string");
                    expect(responseJson.updatedAt).to.be.an("string");
                    expect(response.statusCode).to.eq(200);

                    const dbRecord: Potres2020Webhooks = await Potres2020WebhooksRepo.findOne(webhookUrlToCreate);
                    expect(dbRecord).to.be.an("object");
                    expect(dbRecord).to.contains(webhookUrlToCreate);

                    done();
                });

            });
        });

        describe('with correct Authorization header but with invalid url', () => {

            const webhookUrlToCreate =
                {
                    sharedSecret: 'test-create-with-invalid-url',
                    url: 'some invalid url'
                };

            after(async () => {
                await Potres2020WebhooksRepo.deleteOne(webhookUrlToCreate);
            });

            it('should respond with ApiError and not be inserted into DB', (done) => {

                apiRequest.post({
                    body: JSON.stringify(webhookUrlToCreate),
                    headers: {'Authorization': 'Bearer ' + JWT_TOKEN},
                    url: '/api/potres2020/webhooks'

                }, async (error, response, body) => {
                    expect(error).to.eq(null);

                    const expectedError = new ApiError('Potres2020Webhooks validation failed: url: Not valid url!', 400);
                    const responseJson = JSON.parse(body);
                    expect(responseJson).to.contains(expectedError);
                    const dbRecord: Potres2020Webhooks = await Potres2020WebhooksRepo.findOne(webhookUrlToCreate);
                    expect(dbRecord).to.be.null;

                    done();
                });

            });
        });

        describe('with correct Authorization header but without sharedSecret parameter', () => {

            const webhookUrlToCreate =
                {
                    url: 'https://test-create-without-sharedSecret-webhook-url.com'
                };

            after(async () => {
                await Potres2020WebhooksRepo.deleteOne(webhookUrlToCreate);
            });

            it('should respond with ApiError and not be inserted into DB', (done) => {

                apiRequest.post({
                    body: JSON.stringify(webhookUrlToCreate),
                    headers: {'Authorization': 'Bearer ' + JWT_TOKEN},
                    url: '/api/potres2020/webhooks'

                }, async (error, response, body) => {
                    expect(error).to.eq(null);

                    const expectedError = new ApiError('Potres2020Webhooks validation failed: sharedSecret: sharedSecret is required', 400);
                    const responseJson = JSON.parse(body);
                    expect(responseJson).to.contains(expectedError);
                    const dbRecord: Potres2020Webhooks = await Potres2020WebhooksRepo.findOne(webhookUrlToCreate);
                    expect(dbRecord).to.be.null;

                    done();
                });

            });
        });

        describe('with correct Authorization header but without sharedSecret and url parameters', () => {

            const webhookUrlToCreate =
                {
                    sharedSecretWrong: 'test-create-no-params',
                    urlWrong: 'https://test-create-without-sharedSecret-and-url-webhook-url.com',
                };

            after(async () => {
                await Potres2020WebhooksRepo.deleteOne(webhookUrlToCreate);
            });

            it('should respond with ApiError and not be inserted into DB', (done) => {

                apiRequest.post({
                    body: JSON.stringify(webhookUrlToCreate),
                    headers: {'Authorization': 'Bearer ' + JWT_TOKEN},
                    url: '/api/potres2020/webhooks'

                }, async (error, response, body) => {
                    expect(error).to.eq(null);

                    const expectedError = new ApiError('Potres2020Webhooks validation failed: url: url is required and has to be unique, sharedSecret: sharedSecret is required', 400);
                    const responseJson = JSON.parse(body);
                    expect(responseJson).to.contains(expectedError);
                    const dbRecord: Potres2020Webhooks = await Potres2020WebhooksRepo.findOne(webhookUrlToCreate);
                    expect(dbRecord).to.be.null;

                    done();
                });

            });
        });

        describe('with WRONG Authorization header', () => {

            const webhookUrlToCreate =
                {
                    sharedSecret: 'test-create-wrong',
                    url: 'https://test-wrong-create-webhook-url.com'
                };

            after(async () => {
                await Potres2020WebhooksRepo.deleteOne(webhookUrlToCreate);
            });

            it('should respond with Unauthorized and status 401 and not be inserted into DB', (done) => {

                apiRequest.post({
                    body: JSON.stringify(webhookUrlToCreate),
                    headers: {'Authorization': 'Bearer WRONG TOKEN'},
                    url: '/api/potres2020/webhooks'

                }, async (error, response, body) => {
                    expect(error).to.eq(null);

                    expect(body).to.eq("Unauthorized");
                    expect(response.statusCode).to.eq(401);

                    const dbRecord: Potres2020Webhooks = await Potres2020WebhooksRepo.findOne(webhookUrlToCreate);
                    expect(dbRecord).to.be.null;
                    done();
                });

            });
        });

    });

    describe('GET /api/status', () => {
        it('should return {"status": "OK"}', (done) => {
            apiRequest.get('/api/status',
                async (error, response, body) => {
                    expect(error).to.be.null;
                    expect(JSON.parse(body)).to.contains({"status": "OK"});
                    done();
                });
        });

    });
});

