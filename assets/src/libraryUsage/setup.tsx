import { createMembraneClient } from "../library/noContext/noContextProvider";
import { PeerMetadata, TrackMetadata } from "./types";

export const { useClient, useSelector2 } = createMembraneClient<PeerMetadata, TrackMetadata>();
