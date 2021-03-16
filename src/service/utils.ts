import * as express from "express";
import {SourceRequest} from "../model/ProcessorModel";

const crypto = require("crypto");

export function generateId(): string {
    return crypto.randomBytes(8).toString('hex');
}

export function buildSourceRequest(request: express.Request): SourceRequest {
    const result = Object.assign(new SourceRequest(), request);
    // these are parsed so we have to get and set them
    result.protocol = request.protocol;
    result.hostname = request.hostname;
    return result;
}
