import type { PeerMetadata, TrackMetadata } from "./types";
import { createMembraneClient } from "membrane-react-webrtc-client";

// export const { useConnect, useSelector } = createMembraneClient<PeerMetadata, TrackMetadata>();
// export const { MembraneContextProvider } = createMembrane<PeerMetadata, TrackMetadata>();

export const { MembraneContextProvider, useSelector, useConnect } = createMembraneClient<PeerMetadata, TrackMetadata>();
