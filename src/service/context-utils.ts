const createNamespace = require('continuation-local-storage').createNamespace;
export const requestContext = createNamespace('requestContext');

export function setRequestId(requestId: string) {
    requestContext.set('requestId', requestId);
}
export function getRequestId(): string {
    return requestContext.get('requestId');
}

export function setProcessorRunId(processorRunId: string) {
    requestContext.set('processorRunId', processorRunId);
}
export function getProcessorRunId(): string {
    return requestContext.get('processorRunId');
}