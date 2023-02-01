import { createMembraneClient } from "../library/createMembraneClient";
import { PeerMetadata, TrackMetadata } from "./types";

export const { useClient, useSelector2, useClient2 } = createMembraneClient<PeerMetadata, TrackMetadata>();
