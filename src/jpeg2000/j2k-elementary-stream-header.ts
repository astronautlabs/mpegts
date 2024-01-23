import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class J2kElementaryStreamHeader extends BitstreamElement {
    @Field(32) elsm_box_code = 0x656c736d as const;
    @Field(32) frat_box_code = 0x66726174 as const;
    @Field(16) frat_denominator: number;
    @Field(16) frat_numerator: number;
    @Field(32) brat_box_code = 0x62726174 as const;
    @Field(32) brat_max_br: number;
    @Field(32) brat_auf1: number;
    // TODO
}