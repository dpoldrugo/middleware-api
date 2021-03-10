import {GET, Path} from "typescript-rest";
import {Response} from "typescript-rest-swagger";
import {StatusResponse} from "../model/StatusResponse";

@Path('/api/status')
export class StatusApi {

    /**
     * Status check  - when service is up, it should return:
     * <pre>
     *     {"status": "OK"}
     * </pre>
     */
    @Response<StatusResponse>(200, "OK when you can reach this endpoint!", {status: 'OK'})
    @GET
    public ok() {
        return new StatusResponse("OK");
    }

}