import { BitstreamElement, Field, Reserved } from "@astronautlabs/bitstream";
import { ExtendedTransportTimestamp } from "../transport-timestamp";
import { SystemHeader } from "./system-header";

export class PackHeader extends BitstreamElement {
    @Field(8) length: number;
    @Field(32) packStartCode: number;
    @Field(2) readonly $prefix = 0b01 as const;
    @Field() systemClockReferenceBase: ExtendedTransportTimestamp;
    @Field(22) programMuxRate: number;
    @Field(1) readonly $markerBit1 = 1 as const;
    @Field(1) readonly $markerBit2 = 1 as const;
    @Reserved(5) readonly $reserved: unknown;
    @Field(3) packStuffingLength: number;
    @Field(i => i.packStuffingLength) stuffing: Uint8Array;

    @Field({ 
        readAhead: {
            length: 32,
            presentWhen: r => r.readSync(32) === SystemHeader.START_CODE
        }
    })
    systemHeader: SystemHeader;
}
