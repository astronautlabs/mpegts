import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class MediaTimestamp extends BitstreamElement {
    @Field(32) timescale: number;
    @Field(32) timestamp: number;
}

export class MediaTimestamp2 extends BitstreamElement {
    @Field(32) timescale: number;
    @Field(64) timestamp: bigint;
}
