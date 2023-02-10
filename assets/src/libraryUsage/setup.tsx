import type { PeerMetadata, TrackMetadata } from "./types";
import { createMembraneClient } from "membrane-react-webrtc-client";
import { createNoContextMembraneClient } from "membrane-react-webrtc-client/dist/externalState";

export const { useConnect, useSelector } = createNoContextMembraneClient<PeerMetadata, TrackMetadata>();
export const { MembraneContextProvider } = createMembraneClient<PeerMetadata, TrackMetadata>();

// export const { MembraneContextProvider, useSelector, useConnect } = createMembraneClient<PeerMetadata, TrackMetadata>();
