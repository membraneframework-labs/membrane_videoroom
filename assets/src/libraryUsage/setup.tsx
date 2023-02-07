import { PeerMetadata, TrackMetadata } from "./types";
import { createMembrane } from "../library/createMembrane";
import { createMembraneClient } from "../library/noContext/noContextProvider";

export const { useConnect, useSelector } = createMembraneClient<PeerMetadata, TrackMetadata>();
export const { MembraneContextProvider } = createMembrane<PeerMetadata, TrackMetadata>();
//
// export const { MembraneContextProvider, useSelector, useConnect } = createMembrane<PeerMetadata, TrackMetadata>();
