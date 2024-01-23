import { BitstreamElement, Field } from "@astronautlabs/bitstream";
import { TransportTimestamp } from "../transport-timestamp";

export class SeamlessSplice extends BitstreamElement {
    @Field(4) type: number;
    @Field() dtsNextAccessUnit: TransportTimestamp;
}
