import { PeerMetadata, TrackMetadata } from "./types";
import { createMembrane } from "../library/createMembrane";
import { createMembraneClient } from "../library/noContext/noContextProvider";

export const { useClient, useSelector2 } = createMembraneClient<PeerMetadata, TrackMetadata>();
export const { useMembraneContext, MembraneContextProvider, useSelector, useConnect } = createMembrane<
  PeerMetadata,
  TrackMetadata
>();
