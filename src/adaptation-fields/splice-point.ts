import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class SplicePoint extends BitstreamElement {
    @Field(8) countdown: number;
}
