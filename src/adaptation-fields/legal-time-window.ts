import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class LegalTimeWindow extends BitstreamElement {
    @Field(1) valid: boolean;
    @Field(15) offset: number;
}
