import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class Timecode extends BitstreamElement {
    @Field(1) drop: boolean;
    @Field(15) framesPerTcSeconds: number;
    @Field(16) duration: number;
    @Field(24) timeCode: number;
}

export class Timecode2 extends BitstreamElement {
    @Field(1) drop: boolean;
    @Field(15) framesPerTcSeconds: number;
    @Field(16) duration: number;
    @Field(64) timeCode: number;
}
