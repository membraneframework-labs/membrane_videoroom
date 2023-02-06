import { PeerMetadata, TrackMetadata } from "./types";
import { createMembrane } from "../library/MembraneWebRtcContext";
import { createMembraneClient } from "../library/noContext/noContextProvider";

export const { useClient, useSelector2 } = createMembraneClient<PeerMetadata, TrackMetadata>();
export const { MembraneContext, useMembraneContext, MembraneContextProvider, useMembraneClient } = createMembrane<
  PeerMetadata,
  TrackMetadata
>();
