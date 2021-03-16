import {
    ContextRequest,
    ContextResponse,
    Path,
    PathParam,
    POST,
    PreProcessor
} from "typescript-rest";
import {Container, Inject} from "typescript-ioc";
import * as express from "express";
import {SyncChangesResponse} from "../model/SyncChangesResponse";
import {SourceProcessorRegistry} from "../service/processor/SourceProcessorRegistry";
import {SyncChangesRequest} from "../model/SyncChangesRequest";
import {Response} from "typescript-rest-swagger";
import {ApiError} from "../model/ApiError";
import {buildSourceRequest, generateId} from "../service/utils";
import * as context from "../service/context-utils";

@Path('/api/sync')
export class SyncApi {

    @Inject private sourceProcessorRegistry: SourceProcessorRegistry;

    /**
     * Endpoint for incoming changes from external systems.
     * Changes from the POST body will be processed by one or more {@link SourceProcessor} added to {@link SourceProcessorRegistry}.
     *
     * @param {string} sourceIdentifier the unique identifier of the source of the changes. For now only 'potres2020' is accepted.
     * For 'potres2020' the {@link Potres2020ChangesToPotresAppProcessor} will kick-in and save changes to 'potres.app'
     * @param {SyncChangesRequest} syncChangesRequest json data which should be synced to other systems. Example: [potres2020-test-post.json](/examples-json/test-data/insert/potres2020-test-post.json)
     * @return {SyncChangesResponse}
     */
    @Path('/changes/:sourceIdentifier')
    @PreProcessor((req: express.Request) => {
        const sourceIdentifier = req.path.substring(req.path.lastIndexOf('/')+1);
        Container.get<SourceProcessorRegistry>(SourceProcessorRegistry).getProcessors(sourceIdentifier).forEach(value => value.validateRequest(buildSourceRequest(req)));
    })
    @Response<ApiError>(400, 'id not present in payload', {error: 'id not present in payload', code: 400})
    @POST
    public async changes(
        @PathParam('sourceIdentifier') sourceIdentifier: string,
        // @HeaderParam('X-Ushahidi-Signature', ) sha256: string, // TODO add sha256 validation - requires webhook_uuid to be stored in DB
        syncChangesRequest: SyncChangesRequest, // used just for swagger doc
        @ContextRequest request: express.Request,
        @ContextResponse response: express.Response): Promise<SyncChangesResponse> {
        const syncChangesResponse: SyncChangesResponse = new SyncChangesResponse(request.ip, context.getRequestId());
        const processors = this.sourceProcessorRegistry.getProcessors(sourceIdentifier);
        for (const sourceProcessor of processors) {
            context.setProcessorRunId(generateId());
            syncChangesResponse.addResult(await sourceProcessor.process(buildSourceRequest(request)));
        }
        response.setHeader('X-Request-Id', context.getRequestId());
        syncChangesResponse.saveResultsToDb();
        return syncChangesResponse;
    }
}