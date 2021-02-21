import {createHmac} from "crypto";
import {CheckSha256Request} from "../model/CheckSha256Request";

export class CheckSha256Util {
    public check(checkSha256Request: CheckSha256Request,
                 sharedSecret: string,
    ): boolean {

        const sha256Calculated: string = createHmac('sha256', sharedSecret)
            .update(checkSha256Request.webhookUrl + checkSha256Request.payload)
            .digest('base64');


        return checkSha256Request.sha256Request === sha256Calculated;
    }
}