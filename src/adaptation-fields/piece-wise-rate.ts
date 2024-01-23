import { BitstreamElement, Field, Reserved } from "@astronautlabs/bitstream";

export class PieceWiseRate extends BitstreamElement {
    @Reserved(2) $reserved: unknown;
    @Field(22) value: number;
}
