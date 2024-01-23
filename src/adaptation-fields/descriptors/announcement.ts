import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class TemiAnnouncement extends BitstreamElement {
    @Field(32) timescale: number;
    @Field(32) time_before_activation: number;
}
