import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class TransportPrivateData extends BitstreamElement {
    @Field(8) length: number;
    @Field((i: TransportPrivateData) => i.length) data: Uint8Array;
}
