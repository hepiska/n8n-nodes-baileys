import type {
  IDataObject,
  INodeType,
  INodeTypeDescription,
  IWebhookFunctions,
  IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

const normalizeHeaderValue = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
};

export class BaileysTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Baileys Trigger',
    name: 'baileysTrigger',
    icon: {
      light: 'file:baileysTrigger.svg',
      dark: 'file:baileysTrigger.dark.svg',
    },
    group: ['trigger'],
    version: 1,
    description: 'Receive Baileys events from another service through a webhook',
    defaults: {
      name: 'Baileys Trigger',
    },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'webhook',
      },
    ],
    properties: [
      {
        displayName:
          'Publish this workflow, copy the production webhook URL, and configure your Baileys bridge or external service to send POST requests to it.',
        name: 'webhookNotice',
        type: 'notice',
        default: '',
      },
      {
        displayName: 'Shared Secret',
        name: 'sharedSecret',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        description: 'Optional shared secret expected from the source service',
      },
      {
        displayName: 'Auth Header Name',
        name: 'authHeaderName',
        type: 'string',
        default: 'x-baileys-secret',
        description: 'HTTP header used to send the shared secret',
      },
      {
        displayName: 'Event Header Name',
        name: 'eventHeaderName',
        type: 'string',
        default: 'x-baileys-event',
        description: 'HTTP header that contains the Baileys event name when the payload does not include one',
      },
      {
        displayName: 'Session Header Name',
        name: 'sessionHeaderName',
        type: 'string',
        default: 'x-baileys-session-id',
        description: 'HTTP header that contains the Baileys session identifier when the payload does not include one',
      },
      {
        displayName: 'Response Message',
        name: 'responseMessage',
        type: 'string',
        default: 'Webhook received',
        description: 'Response body returned immediately to the calling service',
      },
    ],
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const res = this.getResponseObject();
    const body = this.getBodyData() as IDataObject;
    const headers = this.getHeaderData();
    const query = this.getQueryData() as IDataObject;
    const sharedSecret = this.getNodeParameter('sharedSecret', '') as string;
    const authHeaderName = (this.getNodeParameter('authHeaderName', 'x-baileys-secret') as string)
      .toLowerCase()
      .trim();

    if (sharedSecret) {
      const providedSecret = normalizeHeaderValue(headers[authHeaderName]);

      if (providedSecret !== sharedSecret) {
        res.status(401).json({ ok: false, message: 'Unauthorized' }).end();

        return {
          noWebhookResponse: true,
        };
      }
    }

    const eventHeaderName = (this.getNodeParameter('eventHeaderName', 'x-baileys-event') as string)
      .toLowerCase()
      .trim();
    const sessionHeaderName = (
      this.getNodeParameter('sessionHeaderName', 'x-baileys-session-id') as string
    )
      .toLowerCase()
      .trim();
    const responseMessage = this.getNodeParameter('responseMessage', 'Webhook received') as string;

    const eventType =
      typeof body.eventType === 'string'
        ? body.eventType
        : typeof body.event === 'string'
          ? body.event
          : normalizeHeaderValue(headers[eventHeaderName]) || 'unknown';

    const sessionId =
      typeof body.sessionId === 'string'
        ? body.sessionId
        : normalizeHeaderValue(headers[sessionHeaderName]) || null;

    const normalizedPayload: IDataObject = {
      eventType,
      sessionId,
      source: 'webhook',
      webhook: {
        method: req.method,
        url: req.url,
        query,
        headers: headers as unknown as IDataObject,
      },
      payload: body,
      receivedAt: new Date().toISOString(),
    };

    if (typeof body.messages !== 'undefined') {
      normalizedPayload.messages = body.messages;
    }

    if (typeof body.connection !== 'undefined') {
      normalizedPayload.connection = body.connection;
    }

    if (typeof body.presences !== 'undefined') {
      normalizedPayload.presences = body.presences;
    }

    if (typeof body.receipt !== 'undefined') {
      normalizedPayload.receipt = body.receipt;
    }

    return {
      webhookResponse: responseMessage,
      workflowData: [this.helpers.returnJsonArray([normalizedPayload])],
    };
  }
}
