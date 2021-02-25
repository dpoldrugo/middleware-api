import {Path, POST, Security} from "typescript-rest";
import {Potres2020Webhooks} from "../model/Potres2020WebhooksDocument";
import Potres2020WebhooksRepo from "../model/Potres2020WebhooksDocument";
import {Tags} from "typescript-rest-swagger";

@Path('/api/potres2020/webhooks')
export class WebhooksApi {

    /**
     * Save Potres2020 webhooks so {@link UtilsApi} can check sha256 based on on a stored shared secret.
     *
     * @param {Potres2020Webhooks} createWebhookRequest
     * @return {Potres2020Webhooks} with additional database properties.
     */
    @POST
    @Tags('potres2020')
    @Security()
    public createWebhook(createWebhookRequest: Potres2020Webhooks): Promise<Potres2020Webhooks> {
        return Potres2020WebhooksRepo.create(createWebhookRequest);
    }
}