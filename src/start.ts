'use strict';

import { ApiServer } from './api-server';
import { MongoConnector } from "./mongo-connector";

if (process.env.NODE_ENV) {
    require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });
}

export async function start(): Promise<void> {
    const mongoConnector = new MongoConnector();
    const apiServer = new ApiServer();
    await apiServer.start();
    await mongoConnector.connect();
    const graceful = async () => {
        await mongoConnector.disconnect();
        await apiServer.stop();
        process.exit(0);
    };

    // Stop graceful
    process.on('SIGTERM', graceful);
    process.on('SIGINT', graceful);
}
