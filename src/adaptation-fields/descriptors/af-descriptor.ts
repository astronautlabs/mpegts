import { BitstreamElement, DefaultVariant, Field, Variant } from "@astronautlabs/bitstream";

export class AFDescriptor extends BitstreamElement {
    @Field(8) tag: number;
    @Field(8) length: number;
}

@DefaultVariant()
export class UnknownAFDescriptor extends AFDescriptor {
    @Field(i => i.length) data: Uint8Array;
}
