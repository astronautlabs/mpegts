import { BitstreamElement, Field, Reserved } from "@astronautlabs/bitstream";

export class AvcVideoDescriptor extends BitstreamElement {
    @Field(8) descriptor_tag: number;
    @Field(8) descriptor_length: number;
    @Field(8) profile_idc: number;
    @Field(1) constraint_set0_flag: boolean;
    @Field(1) constraint_set1_flag: boolean;
    @Field(1) constraint_set2_flag: boolean;
    @Field(1) constraint_set3_flag: boolean;
    @Field(1) constraint_set4_flag: boolean;
    @Field(1) constraint_set5_flag: boolean;
    @Field(2) avc_compatible_flags: boolean;
    @Field(8) level_idc: number;
    @Field(1) avc_still_present: boolean;
    @Field(1) avc_24_hour_picture_flag: boolean;
    @Field(1) frame_packing_sei_not_present_flag: boolean;
    @Reserved(5) reserved: unknown;
}