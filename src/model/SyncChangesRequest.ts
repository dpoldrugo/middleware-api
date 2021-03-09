/**
 * JSON payload of the changes to sync to other systems.
 * The format has to be compatible with one of the {@link SourceProcessor} implementations.
 * Example: [potres2020-test-post.json](/examples-json/test-data/insert/potres2020-test-post.json)
 */
export class SyncChangesRequest {

    // public sourceRequest: express.Request; // had to remove this because it caused that request appeared in request.body.sourceRequest
    // and caused circular dependency when serializing response to json
}