import {Errors, Path, POST} from "typescript-rest";
import {Example, Response, Tags} from "typescript-rest-swagger";
import {CheckSha256Request} from "../model/CheckSha256Request";
import {CheckSha256Response} from "../model/CheckSha256Response";
import {CheckSha256Util} from "../service/CheckSha256Util";
import Potres2020WebhooksRepo, {Potres2020Webhooks} from "../model/Potres2020WebhooksDocument";
import {ApiError} from "../model/ApiError";
import {Inject} from "typescript-ioc";

/**
 * @see checkSha256
 */
@Path('/api/potres2020/utils')
export class UtilsApi {

    @Inject private checkSha256Util: CheckSha256Util;

    /**
     * Checks sha256 by comparing the sha256 from the request which originated from Ushahidi and the calculated sha256 based
     * on {@link CheckSha256Request.webhookUrl}, {@link CheckSha256Request.payload} and signing it with a previously
     * stored {@link Potres2020Webhooks.sharedSecret} via the {@link WebhooksApi}.
     *
     * More info: [Ushahidi - Web hooks](https://docs.ushahidi.com/platform-developer-documentation/tech-stack/connected-app-development/web-hooks)
     * @param checkSha256Request
     */
    @Path('/checkSha256')
    @Tags('potres2020')
    @Example({sha256Request:'sha256 from Ushahidi', webhookUrl: 'webhook url as defined in Ushahidi', payload: 'the payload which you received from Ushahidi'})
    @Response<CheckSha256Response>(200, 'when sha\'s match - check passes, otherwise: {"valid": false}', {valid: true})
    @Response<ApiError>(400, 'When webhookUrl is not defined', {error:'Webhook not defined! Webhook: https://WRONG-WEBHOOK-URL.COM', code: 400})
    @POST
    public checkSha256(checkSha256Request: CheckSha256Request): Promise<CheckSha256Response> {
        return this.getSharedSecretForWebhookUrl(checkSha256Request.webhookUrl)
            .then(value => {
                if (value == null)
                    throw new Errors.BadRequestError(`Webhook not defined! Webhook: ${checkSha256Request.webhookUrl}`);
                return new CheckSha256Response(this.checkSha256Util.check(checkSha256Request, value.sharedSecret));
            });

    }

    private getSharedSecretForWebhookUrl(webhookUrl: string): Promise<Potres2020Webhooks> {
        return Potres2020WebhooksRepo.findOne({url: webhookUrl}).exec();
    }

}