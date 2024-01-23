import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class PStdBuffer extends BitstreamElement {
    @Field(2) readonly $prefix = 0b01 as const;
    @Field(1) scale: boolean;
    @Field(13) size: number;
}