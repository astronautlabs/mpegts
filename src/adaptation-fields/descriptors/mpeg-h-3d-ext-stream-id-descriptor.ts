import { Field, Reserved, Variant } from "@astronautlabs/bitstream";
import { AFDescriptor } from "./af-descriptor";

@Variant(i => i.tag === 0x08)
export class MpegH3dAudioExtendedStreamIDDescriptor extends AFDescriptor {
    @Reserved(1) reserved: number;
    @Field(7) auxiliaryStreamID: number;
}
