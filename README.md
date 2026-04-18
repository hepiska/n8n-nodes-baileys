# n8n-nodes-baileys

This is an n8n community node package with basic starter nodes for a future Baileys / WhatsApp integration.

Included starter nodes:

- **Baileys Message Builder**: Builds a simple Baileys-style message payload.
- **Baileys Connection Info**: Returns mock connection/session information for workflow prototyping.

[n8n](https://n8n.io/) is a workflow automation platform.

## Installation

Follow the community node installation guide in the n8n documentation.

## Operations

### Baileys Message Builder

- Build a text payload
- Choose a basic message type
- Optionally include a timestamp

### Baileys Connection Info

- Generate a starter session object
- Return mock connection state for testing workflows

## Credentials

These starter nodes do not require credentials yet.

## Compatibility

- Node.js 22+
- Built for current n8n community node tooling

## Usage

Use these nodes as a clean starting point before adding real Baileys authentication, socket handling, and WhatsApp send/receive operations.

## Resources

- https://docs.n8n.io/integrations/creating-nodes/
- https://docs.n8n.io/integrations/community-nodes/installation/
- https://github.com/WhiskeySockets/Baileys

## Version history

### 0.1.0

- Initial starter package with two basic Baileys-oriented nodes
