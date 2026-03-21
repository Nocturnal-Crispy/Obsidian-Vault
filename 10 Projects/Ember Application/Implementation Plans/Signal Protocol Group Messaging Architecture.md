
## Overview  
  
This document defines the architecture and implementation plan for supporting **Signal Protocol group messaging**, including the correct handling of:  
  
- Groups that start with a single user  
- Transition from pairwise encryption → sender-key group encryption  
- Sender key distribution and rotation  
- Safe decryption routing  
  
---  
  
## Core Principle  
  
> A conversation can be a **group in the product model** before it is a **group in the cryptographic model**.  
  
- UX and data model ≠ crypto readiness  
- Crypto mode must be explicitly tracked and enforced  
  
---  
  
## Crypto Modes  
  
```ts  
type CryptoMode =  
  | 'pairwise_bootstrap'  
  | 'sender_key_active';  
  
type SenderKeyStatus =  
  | 'not_initialized'  
  | 'distributing'  
  | 'active'  
  | 'rotation_required';

---

## Lifecycle

### Phase 1 — Group Created (1 Member)

- Group exists in app
- Use **pairwise Signal sessions**
- Do NOT use sender keys

cryptoMode = pairwise_bootstrap  
senderKeyStatus = not_initialized

---

### Phase 2 — Member Added

- Generate sender key
- Create `SenderKeyDistributionMessage`
- Send via pairwise sessions

senderKeyStatus = distributing

---

### Phase 3 — Bootstrap Complete

- All members have sender key
- Switch to group encryption

cryptoMode = sender_key_active  
senderKeyStatus = active

---

### Phase 4 — Membership Change

- Rotate sender key
- Re-distribute to all members

senderKeyStatus = rotation_required

---

## Encryption Rules

### Pairwise Mode

Use when:

- group has ≤ 2 participants
- OR sender key not initialized

SessionCipher.encrypt(...)

---

### Sender-Key Mode

Use when:

cryptoMode === 'sender_key_active'

GroupCipher.encrypt(...)

---

## Decryption Rules

### ALWAYS route by message type, NOT conversation type

function decryptIncoming(envelope, conversation) {  
  switch (envelope.wireType) {  
    case 'prekey':  
      return decryptPreKey(envelope);  
  
    case 'signal':  
      return decryptSession(envelope);  
  
    case 'sender_key':  
      if (!conversation.activeDistributionId) {  
        throw new Error('Sender key not initialized');  
      }  
  
      if (envelope.distributionId !== conversation.activeDistributionId) {  
        throw new Error('Distribution mismatch');  
      }  
  
      return decryptSenderKey(envelope);  
  
    default:  
      throw new Error('Unknown message type');  
  }  
}

---

## Architecture Diagram

flowchart TD  
    A[Create Group] --> B[Add Members]  
    B --> C[Crypto Orchestrator]  
  
    C --> D{Sender Key Ready?}  
  
    D -->|No| E[Pairwise Encryption]  
    D -->|Yes| F[Sender Key Encryption]  
  
    F --> G[Generate Sender Key]  
    G --> H[Send Distribution Message]  
    H --> I[Wait for Delivery]  
  
    I --> J{All Members Synced?}  
    J -->|No| E  
    J -->|Yes| F  
  
    K[Incoming Message] --> L{Message Type}  
    L -->|Signal| M[Session Decrypt]  
    L -->|PreKey| N[PreKey Decrypt]  
    L -->|SenderKey| O[Group Decrypt]

---

## Service Architecture

flowchart LR  
    UI --> ConversationService  
    UI --> MessageService  
  
    ConversationService --> MembershipService  
    ConversationService --> CryptoOrchestrator  
  
    MessageService --> CryptoOrchestrator  
  
    CryptoOrchestrator --> SessionStore  
    CryptoOrchestrator --> SenderKeyStore  
    CryptoOrchestrator --> IdentityStore  
  
    MessageService --> Transport  
    Transport --> Server

---

## Data Model

### Conversation

Conversation {  
  id: UUID  
  kind: 'direct' | 'group'  
  cryptoMode: 'pairwise_bootstrap' | 'sender_key_active'  
  senderKeyStatus: string  
  activeDistributionId: string | null  
  senderKeyEpoch: number  
}

---

### Membership

ConversationMember {  
  conversationId: UUID  
  userId: UUID  
  deviceId: number  
  role: string  
}

---

### Sender Key Tracking

SenderKeyDistributionReceipt {  
  conversationId: UUID  
  distributionId: string  
  recipientUserId: UUID  
  status: 'pending' | 'sent' | 'acknowledged'  
}

---

### Message Envelope

MessageEnvelope {  
  messageId: UUID  
  conversationId: UUID  
  wireType: 'prekey' | 'signal' | 'sender_key'  
  distributionId: string | null  
  ciphertext: bytes  
}

---

## Crypto Routing Rules

function shouldUseSenderKey(conversation) {  
  return (  
    conversation.kind === 'group' &&  
    conversation.memberCount >= 3 &&  
    conversation.senderKeyStatus === 'active'  
  );  
}

---

## Implementation Plan

### Phase 1 — Add Crypto State

- Add:
    - `cryptoMode`
    - `senderKeyStatus`
    - `distributionId`
    - `epoch`

---

### Phase 2 — Crypto Routing Service

Create:

CryptoRoutingService

Handles:

- encryption mode selection
- decryption routing
- validation

---

### Phase 3 — Pairwise Bootstrap

- Groups start as pairwise
- No sender-key usage

---

### Phase 4 — Sender-Key Bootstrap

- Generate sender key
- Send distribution via pairwise
- Track delivery

---

### Phase 5 — Activate Sender-Key Mode

- Flip only after successful distribution

---

### Phase 6 — Rotation

On membership change:

- regenerate sender key
- redistribute

---

### Phase 7 — Validation

Reject if:

- missing distributionId
- mismatched distribution
- sender not in group
- sender key not initialized

---

### Phase 8 — Observability

Log:

- crypto mode decisions
- distribution events
- decrypt paths
- failures

---

### Phase 9 — Testing

Must include:

1. Group of 1 works (pairwise)
2. Add member → bootstrap
3. Sender key activation
4. Invalid sender key rejection
5. Distribution mismatch
6. Membership rotation
7. Out-of-order delivery
8. Multi-device handling

---

## Critical Rules

### DO

- Separate app model from crypto model
- Route by message type
- Delay sender-key usage until ready
- Rotate keys on membership changes

---

### DO NOT

- Treat group-of-1 as sender-key group
- Send SenderKeyMessage before distribution
- Infer crypto mode from `is_group`
- Skip distribution step

---

## Final Recommendation

canUseSenderKey =  
  group &&  
  memberCount >= 3 &&  
  senderKeyStatus === 'active'

---

## Summary

- Groups start as **pairwise**
- Transition to **sender-key only after bootstrap**
- Decryption is **message-type driven**
- Membership changes require **key rotation**

---

**This design avoids:**

- sender-key desync bugs
- missing distribution errors
- invalid decrypt paths
- state inconsistencies