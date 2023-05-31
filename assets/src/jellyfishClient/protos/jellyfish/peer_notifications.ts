/* eslint-disable */
import * as _m0 from "protobufjs/minimal";

export const protobufPackage = "jellyfish";

export interface PeerMessage {
  authenticated?: PeerMessage_Authenticated | undefined;
  authRequest?: PeerMessage_AuthRequest | undefined;
  mediaEvent?: PeerMessage_MediaEvent | undefined;
}

export interface PeerMessage_Authenticated {}

export interface PeerMessage_AuthRequest {
  token: string;
}

export interface PeerMessage_MediaEvent {
  data: string;
}

function createBasePeerMessage(): PeerMessage {
  return { authenticated: undefined, authRequest: undefined, mediaEvent: undefined };
}

export const PeerMessage = {
  encode(message: PeerMessage, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authenticated !== undefined) {
      PeerMessage_Authenticated.encode(message.authenticated, writer.uint32(10).fork()).ldelim();
    }
    if (message.authRequest !== undefined) {
      PeerMessage_AuthRequest.encode(message.authRequest, writer.uint32(18).fork()).ldelim();
    }
    if (message.mediaEvent !== undefined) {
      PeerMessage_MediaEvent.encode(message.mediaEvent, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeerMessage {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeerMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.authenticated = PeerMessage_Authenticated.decode(reader, reader.uint32());
          continue;
        case 2:
          if (tag !== 18) {
            break;
          }

          message.authRequest = PeerMessage_AuthRequest.decode(reader, reader.uint32());
          continue;
        case 3:
          if (tag !== 26) {
            break;
          }

          message.mediaEvent = PeerMessage_MediaEvent.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PeerMessage {
    return {
      authenticated: isSet(object.authenticated) ? PeerMessage_Authenticated.fromJSON(object.authenticated) : undefined,
      authRequest: isSet(object.authRequest) ? PeerMessage_AuthRequest.fromJSON(object.authRequest) : undefined,
      mediaEvent: isSet(object.mediaEvent) ? PeerMessage_MediaEvent.fromJSON(object.mediaEvent) : undefined,
    };
  },

  toJSON(message: PeerMessage): unknown {
    const obj: any = {};
    message.authenticated !== undefined &&
      (obj.authenticated = message.authenticated ? PeerMessage_Authenticated.toJSON(message.authenticated) : undefined);
    message.authRequest !== undefined &&
      (obj.authRequest = message.authRequest ? PeerMessage_AuthRequest.toJSON(message.authRequest) : undefined);
    message.mediaEvent !== undefined &&
      (obj.mediaEvent = message.mediaEvent ? PeerMessage_MediaEvent.toJSON(message.mediaEvent) : undefined);
    return obj;
  },

  create<I extends Exact<DeepPartial<PeerMessage>, I>>(base?: I): PeerMessage {
    return PeerMessage.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PeerMessage>, I>>(object: I): PeerMessage {
    const message = createBasePeerMessage();
    message.authenticated =
      object.authenticated !== undefined && object.authenticated !== null
        ? PeerMessage_Authenticated.fromPartial(object.authenticated)
        : undefined;
    message.authRequest =
      object.authRequest !== undefined && object.authRequest !== null
        ? PeerMessage_AuthRequest.fromPartial(object.authRequest)
        : undefined;
    message.mediaEvent =
      object.mediaEvent !== undefined && object.mediaEvent !== null
        ? PeerMessage_MediaEvent.fromPartial(object.mediaEvent)
        : undefined;
    return message;
  },
};

function createBasePeerMessage_Authenticated(): PeerMessage_Authenticated {
  return {};
}

export const PeerMessage_Authenticated = {
  encode(_: PeerMessage_Authenticated, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeerMessage_Authenticated {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeerMessage_Authenticated();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(_: any): PeerMessage_Authenticated {
    return {};
  },

  toJSON(_: PeerMessage_Authenticated): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<PeerMessage_Authenticated>, I>>(base?: I): PeerMessage_Authenticated {
    return PeerMessage_Authenticated.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PeerMessage_Authenticated>, I>>(_: I): PeerMessage_Authenticated {
    const message = createBasePeerMessage_Authenticated();
    return message;
  },
};

function createBasePeerMessage_AuthRequest(): PeerMessage_AuthRequest {
  return { token: "" };
}

export const PeerMessage_AuthRequest = {
  encode(message: PeerMessage_AuthRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.token !== "") {
      writer.uint32(10).string(message.token);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeerMessage_AuthRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeerMessage_AuthRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.token = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PeerMessage_AuthRequest {
    return { token: isSet(object.token) ? String(object.token) : "" };
  },

  toJSON(message: PeerMessage_AuthRequest): unknown {
    const obj: any = {};
    message.token !== undefined && (obj.token = message.token);
    return obj;
  },

  create<I extends Exact<DeepPartial<PeerMessage_AuthRequest>, I>>(base?: I): PeerMessage_AuthRequest {
    return PeerMessage_AuthRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PeerMessage_AuthRequest>, I>>(object: I): PeerMessage_AuthRequest {
    const message = createBasePeerMessage_AuthRequest();
    message.token = object.token ?? "";
    return message;
  },
};

function createBasePeerMessage_MediaEvent(): PeerMessage_MediaEvent {
  return { data: "" };
}

export const PeerMessage_MediaEvent = {
  encode(message: PeerMessage_MediaEvent, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data !== "") {
      writer.uint32(10).string(message.data);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PeerMessage_MediaEvent {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeerMessage_MediaEvent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag !== 10) {
            break;
          }

          message.data = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  fromJSON(object: any): PeerMessage_MediaEvent {
    return { data: isSet(object.data) ? String(object.data) : "" };
  },

  toJSON(message: PeerMessage_MediaEvent): unknown {
    const obj: any = {};
    message.data !== undefined && (obj.data = message.data);
    return obj;
  },

  create<I extends Exact<DeepPartial<PeerMessage_MediaEvent>, I>>(base?: I): PeerMessage_MediaEvent {
    return PeerMessage_MediaEvent.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<PeerMessage_MediaEvent>, I>>(object: I): PeerMessage_MediaEvent {
    const message = createBasePeerMessage_MediaEvent();
    message.data = object.data ?? "";
    return message;
  },
};

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
