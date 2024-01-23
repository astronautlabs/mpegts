import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class PTPTimestamp extends BitstreamElement {
    @Field(80) value: bigint;
}
