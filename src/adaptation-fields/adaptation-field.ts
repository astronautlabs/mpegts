import { BitstreamElement, Field, Marker, Reserved, Variant, VariantMarker } from "@astronautlabs/bitstream";
import { SeamlessSplice } from "./seamless-splice";
import { LegalTimeWindow } from "./legal-time-window";
import { PieceWiseRate } from "./piece-wise-rate";
import { ProgramClockReference } from "./program-clock-reference";
import { SplicePoint } from "./splice-point";
import { TransportPrivateData } from "./transport-private-data";
import { AFDescriptor } from "./descriptors";
import type { TransportPacket } from "../transport-packet";

export class AdaptationField extends BitstreamElement {
    get parent() { return super.parent as TransportPacket; }
    
    @Field(8, { writtenValue: (i: AdaptationField) => i.measureFrom(i => i.$payloadStart) }) length: number;

    @Marker() $payloadStart;
    @VariantMarker() $variantMarker;
    @Marker() $payloadEnd;

    /**
     * Since MPEG transport packets are always exactly 188 bytes long (4 byte header + 184 bytes of adaptation field / payload),
     * it is needed to add extra bytes when the payload amount is less than 184 bytes. This is called "stuffing" in the 
     * spec. The main way this is done is by strategically selecting the included adaptation field structure, including
     * setting the adaptation field's length to longer than the size of the data structure. All stuffing bytes not 
     * covered by the adaptation field itself must be 0xFF.
     * 
     * So, for instance:
     * - Payload is 1 byte shorter than packet size: Include an adaptation field, but give it zero length (adds 1 byte)
     * - Payload is 2 bytes shorter than packet size: Include an adaptation field, give it length 1, but set all the 
     *   header bits to zero (adds 2 bytes, no additional structures)
     * - Payload is 3 bytes shorter than packet size: Same as above + 1 stuffing byte
     * - Payload is 4 bytes shorter than packet size: Same + 2 stuffing bytes
     * - etc
     */
    @Field((i: AdaptationField) => i.length - i.measure(i => i.$payloadStart, i => i.$payloadEnd), {
        writtenValue: (i: AdaptationField) => new Uint8Array(i.measureField(i => i.stuffing) / 8).map(() => 0xFF)
    })
    stuffing: Uint8Array;
}

@Variant((i: AdaptationField) => i.length === 0)
export class EmptyAdaptationField extends AdaptationField {
}

@Variant((i: AdaptationField) => i.length > 0)
export class FullAdaptationField extends AdaptationField {
    @Field() readonly header = new FullAdaptationFieldHeader();

    @Field(0, { presentWhen: i => i.header.pcr })                       pcr: ProgramClockReference;
    @Field(0, { presentWhen: i => i.header.opcr })                      opcr: ProgramClockReference;
    @Field(8, { presentWhen: i => i.header.splicePoint })               splicePoint: SplicePoint;
    @Field(8, { presentWhen: i => i.header.transportPrivateData })      transportPrivateData: TransportPrivateData;
}

export class FullAdaptationFieldHeader extends BitstreamElement {
    get parent() { return super.parent as FullAdaptationField }

    @Field(1)                                                           discontinuityIndicator: boolean;
    @Field(1)                                                           randomAccessIndicator: boolean;
    @Field(1)                                                           elementaryStreamPriorityIndicator: boolean;
    @Field(1, { writtenValue: i => !!i.parent.pcr })                    pcr: boolean;
    @Field(1, { writtenValue: i => !!i.parent.opcr })                   opcr: boolean;
    @Field(1, { writtenValue: i => !!i.parent.splicePoint })            splicePoint: boolean;
    @Field(1, { writtenValue: i => !!i.parent.transportPrivateData })   transportPrivateData: boolean;
    @Field(1)                                                           extension: boolean;
}

@Variant((i: FullAdaptationField) => i.header.extension)
export class ExtendedAdaptationField extends FullAdaptationField {
    constructor() {
        super();
        this.header.extension = true;
    }

    @Field(8, { writtenValue: (i: ExtendedAdaptationField) => i.measureFrom(i => i.$extensionStart) }) 
    extensionLength: number;

    @Marker() $extensionStart;

    @Field(1) ltwFlag: boolean;
    @Field(1) piecewiseRateFlag: boolean;
    @Field(1) seamlessSpliceFlag: boolean;
    @Field(1) afDescriptorNotPresentFlag: boolean;
    @Reserved(4) $reserved: unknown;

    @Field(0, { presentWhen: i => i.ltwFlag }) legalTimeWindow: LegalTimeWindow;
    @Field(0, { presentWhen: i => i.piecewiseRateFlag }) piecewiseRate: PieceWiseRate;
    @Field(0, { presentWhen: i => i.seamlessSpliceFlag }) seamlessSplice: SeamlessSplice;
    @Field(0, { 
        presentWhen: i => !i.afDescriptorNotPresentFlag,
        array: {

        }
    }) 
    afDescriptors: AFDescriptor[];

    onSerializeStarted(): void {
        this.header.extension = true;
    }
}
