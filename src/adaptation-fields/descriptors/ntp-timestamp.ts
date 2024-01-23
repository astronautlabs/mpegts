import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class NTPTimestamp extends BitstreamElement {
    @Field(64) value: bigint;
}
