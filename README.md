## API doc
- [Swagger](https://potres2020-middlware-api.herokuapp.com/api-docs/)
- [Postman collection](https://documenter.getpostman.com/view/130981/TW6wK9GV)

## API's

### POST /api/sync/changes/:sourceIdentifier
    /**
     * Endpoint for incoming changes from external systems.
     * Changes from the POST body will be processed by one or more {@link SourceProcessor} added to {@link SourceProcessorRegistry}.
     *
     * @param {string} sourceIdentifier the unique identifier of the source of the changes. For now only 'potres2020' is accepted.
     * For 'potres2020' the {@link Potres2020ChangesToPotresAppProcessor} will kick-in and save changes to 'potres.app'
     * @param {SyncChangesRequest} syncChangesRequest json data which should be synced to other systems. Example: [potres2020-test-post.json](/examples-json/test-data/insert/potres2020-test-post.json)
     * @return {SyncChangesResponse}
     */

### POST /api/potres2020/utils/checkSha256
    /**
     * Checks sha256 by comparing the sha256 from the request which originated from Ushahidi and the calculated sha256 based
     * on {@link CheckSha256Request.webhookUrl}, {@link CheckSha256Request.payload} and signing it with a previously
     * stored {@link Potres2020Webhooks.sharedSecret} via the {@link WebhooksApi}.
     *
     * More info: [Ushahidi - Web hooks](https://docs.ushahidi.com/platform-developer-documentation/tech-stack/connected-app-development/web-hooks)
     * @param checkSha256Request
     */

### POST /api/potres2020/webhooks
    /**
     * Save Potres2020 webhooks so {@link UtilsApi} can check sha256 based on on a stored shared secret.
     *
     * @param {Potres2020Webhooks} createWebhookRequest
     * @return {Potres2020Webhooks} with additional database properties.
     */

### GET /api/status
    /**
     * Status check which is service is up should return:
     * <pre>
     *     {"status": "OK"}
     * </pre>
     */

## Development & Deployment

Source code: https://github.com/dpoldrugo/middleware-api

Written in Typescript (NodeJS).

Production is currently deployed on Heroku: https://potres2020-middlware-api.herokuapp.com

The easiest way how to run it for yourself is like this: [Run your version on Repl.it](https://repl.it/github/dpoldrugo/middleware-api)

### Local setup

#### Requirements
 - NodeJS >=v12.18.3
 - docker
 - docker-compose

#### Running locally

 ```bash
 npm install
 npm run-script test:coverage
 ```
```bash
npm run-script start:dev
```