import * as test_utils from "../test-utils/utils";
test_utils.initEnvFile();
import {CheckSha256Request} from "../../src/model/CheckSha256Request";
import {CheckSha256Util} from "../../src/service/CheckSha256Util";
import * as chai from 'chai';
import {describe, test} from 'mocha';
import {Container, Inject} from "typescript-ioc";

const expect = chai.expect;
const checkSha256Util: CheckSha256Util = Container.get(CheckSha256Util);

describe("CheckSha256Util.check", () => {
    it("should be true for a correct sha256, webhookUrl and payload", () => {

        expect(
            checkSha256Util.check(new CheckSha256Request(
                '0IKKTG9u3lNxSx+s06Huf5BI6xvzUWo0XrvqvW3LXaE=',
                'https://test-webhook-url.com',
                '{"id":915, "form_id":5}'), "test-shared-secret"))
            .to.eq(true);
    });
});

