import { BitstreamElement, DefaultVariant, Field, Variant } from "@astronautlabs/bitstream";
import { FlagAccess, SideEffect } from "./utils";
import { AdaptationField } from "./adaptation-fields/adaptation-field";

export class TransportPacket extends BitstreamElement {
    @Field(8) readonly syncByte = 0b01000111 as const;
    @Field(1) transportErrorIndicator: boolean;
    @Field(1) payloadUnitStartIndicator: boolean;
    @Field(1) transportPriority: boolean;
    @Field(13) pid: number;
    @Field(2) transportScramblingControl: number;
    @Field(2) adaptationFieldControl: number;
    @Field(4) continuityCounter: number;

    @FlagAccess(i => i.adaptationFieldControl, 0b10) hasAdaptationField: boolean;
    @FlagAccess(i => i.adaptationFieldControl, 0b01) hasPayload: boolean;

    @SideEffect((v, _, i) => i.hasAdaptationField = !!v)
    @Field(0, { presentWhen: i => i.hasAdaptationField })
    adaptationField: AdaptationField;

    @Field(8, { presentWhen: i => i.payloadUnitStartIndicator })
    pointerField: number;
}

@DefaultVariant()
export class UnknownTransportPacket extends TransportPacket {
    @Field(i => 184 - (i.adaptationField ? i.measureField(i => i.adaptationField) : 0)) 
    data: Uint8Array;
}