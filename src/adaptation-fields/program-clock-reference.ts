import { BitstreamElement, Field, Reserved } from "@astronautlabs/bitstream";

export class ProgramClockReference extends BitstreamElement {
    @Field(33)      base: number;
    @Reserved(6)    $reserved: number;
    @Field(9)       extension: number;
}
