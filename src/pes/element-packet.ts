import { BitstreamElement, DefaultVariant, Field, Marker, Reserved, Variant, VariantMarker, Serializer, BitstreamReader, BitstreamWriter, FieldDefinition, IncompleteReadResult, StructureSerializer } from "@astronautlabs/bitstream";
import { ExtendedTransportTimestamp, TransportTimestamp } from "../transport-timestamp";
import { TrickModeControl } from "./trick-mode-controls";
import { PackHeader } from "./pack-header";
import { PStdBuffer } from "./p-std-buffer";

export class StreamID {
    static readonly PROGRAM_STREAM_MAP          = 0b1011_1100;
    static readonly PRIVATE_1                   = 0b1011_1101;
    static readonly PADDING                     = 0b1011_1110;
    static readonly PRIVATE_2                   = 0b1011_1111;
    static readonly ECM                         = 0b1111_0000;
    static readonly EMM                         = 0b1111_0001;
    static readonly DSM_CC                      = 0b1111_0010;
    static readonly ISO_IEC_13522               = 0b1111_0011;
    static readonly ITUT_H_222_1_A              = 0b1111_0100;
    static readonly ITUT_H_222_1_B              = 0b1111_0101;
    static readonly ITUT_H_222_1_C              = 0b1111_0110;
    static readonly ITUT_H_222_1_D              = 0b1111_0111;
    static readonly ITUT_H_222_1_E              = 0b1111_1000;
    static readonly ANCILLARY                   = 0b1111_1001;
    static readonly ISO_IEC_14496_1_SL          = 0b1111_1010;
    static readonly ISO_IEC_14496_1_M4MUX       = 0b1111_1011;
    static readonly METADATA_STREAM             = 0b1111_1100;
    static readonly EXTENDED_STREAM_ID          = 0b1111_1101;
    static readonly RESERVED_DATA               = 0b1111_1110;
    static readonly PROGRAM_STREAM_DIRECTORY    = 0b1111_1111;

    static audioStream(number: number) {
        if (number < 0 || number > 31)
            throw new Error(`Stream number must be between 0 and 31`);
        return 0b1100_0000 | number;
    }

    static videoStream(number: number) {
        if (number < 0 || number > 15)
            throw new Error(`Stream number must be between 0 and 15`);
        return 0b1110_0000 | number;
    }

    static getAudioStreamNumber(streamId: number) {
        return (streamId & 0b1_1111);
    }

    static getVideoStreamNumber(streamId: number) {
        return (streamId & 0b1111);
    }

    static isAudioStream(streamId: number) {
        return (streamId & 0b1110_0000) === 0b1100_0000;
    }

    static isVideoStream(streamId: number) {
        return (streamId & 0b1111_0000) === 0b1110_0000;
    }
}

export const RAW_STREAM_TYPES = [
    StreamID.PROGRAM_STREAM_MAP,
    StreamID.ECM,
    StreamID.EMM,
    StreamID.PROGRAM_STREAM_DIRECTORY,
    StreamID.DSM_CC,
    StreamID.ITUT_H_222_1_E
];


/**
 * Represents a PES (Packetized Elementary Stream) packet.
 */
export class ElementPacket extends BitstreamElement {
    @Field(24) packetStartCodePrefix: number;
    @Field(8) streamId: number;
    @Field(16) length: number;
}

@Variant(i => RAW_STREAM_TYPES.includes(i.streamId))
export class RawElementPacket extends ElementPacket {
    @Field(i => i.length)
    data: Uint8Array;
}

@Variant(i => RAW_STREAM_TYPES.includes(i.streamId))
export class PaddingPacket extends ElementPacket {
    @Field(i => i.length)
    data: Uint8Array;
}

@DefaultVariant()
export class StandardElementPacket extends ElementPacket {
    @Marker() $startOfPacket;
    @Field(2) readonly $prefix = 0b10 as const;
    @Field(2) scramblingControl: number;
    @Field(1) priority: boolean;
    @Field(1) dataAlignmentIndicator: boolean;
    @Field(1) copyright: boolean;
    @Field(1) original: boolean;
    @Field(2) ptsDtsFlags: number;
    @Field(1) escrFlag: boolean;
    @Field(1) esRateFlag: boolean;
    @Field(1) dsmTrickModeFlag: boolean;
    @Field(1) additionalCopyInfoFlag: boolean;
    @Field(1) crcFlag: boolean;
    @Field(1) extensionFlag: boolean;
    @Field(8) headerDataLength: number;

    @Marker() $headerStart;

    get hasPts() { return (this.ptsDtsFlags & 0b10) !== 0; }
    get hasDts() { return (this.ptsDtsFlags & 0b01) !== 0; }

    /**
     * This should always have the same value as ptsDtsFlags when present.
     */
    @Field(4, { presentWhen: i => i.hasPts }) readonly $timestampPrefix: number;
    @Field({ presentWhen: i => i.hasPts }) pts: TransportTimestamp;
    @Field({ presentWhen: i => i.hasDts }) dts: TransportTimestamp;
    @Field({ presentWhen: i => i.escrFlag }) escr: ExtendedTransportTimestamp;

    @Field(1, { presentWhen: i => i.esRateFlag }) readonly $esRateMarkerBit1: number = 1 as const;
    @Field(22, { presentWhen: i => i.esRateFlag }) esRate: number;
    @Field(1, { presentWhen: i => i.esRateFlag }) readonly $esRateMarkerBit2: number = 1 as const;

    @Field({ presentWhen: i => i.dsmTrickModeFlag }) trickModeControl: TrickModeControl;

    @Field(1, { presentWhen: i => i.additionalCopyInfoFlag }) $additionalCopyInfoMarkerBit1: number = 1 as const;
    @Field(7, { presentWhen: i => i.additionalCopyInfoFlag }) additionalCopyInfo: number;

    @Field(16, { presentWhen: i => i.crcFlag }) previousPacketCRC: number;

    @VariantMarker() $variantMarker;

    @Marker() $headerEnd;

    @Field(i => i.headerDataLength - i.measure(i => i.$headerStart, i => i.$headerEnd) / 8)
    stuffing: Uint8Array;
    
    @Marker() $startOfData;

    @Field(i => i.length - i.measure(i => i.$startOfPacket, i => i.$startOfData))
    data: Uint8Array;
}

@Variant(i => i.extensionFlag)
export class ExtendedElementPacket extends StandardElementPacket {
    @Field(1) privateDataFlag: boolean;
    @Field(1) packHeaderFieldFlag: boolean;
    @Field(1) programPacketSequenceCounterFlag: boolean;
    @Field(1) pStdBufferFlag: boolean;
    @Reserved(3) $reserved: unknown;
    @Field(1) extensionFlag2: boolean;
    @Field(16, { presentWhen: i => i.privateDataFlag }) privateData: Uint8Array;
    @Field({ presentWhen: i => i.packHeaderFieldFlag }) packHeader: PackHeader;
    @Field({ presentWhen: i => i.programPacketSequenceCounterFlag }) programPacketSequenceCounter: ProgramPacketSequenceCounter;
    @Field({ presentWhen: i => i.pStdBufferFlag }) pStdBuffer: PStdBuffer;
}

@Variant(i => i.extensionFlag2)
export class ExtendedElementPacket2 extends ExtendedElementPacket {
    @Field(1) readonly $ext2MarkerBit1 = 1 as const;
    @Field(7) extensionLength: number;
    @Marker() $extensionStart;
    @Field(1) streamIdExtensionFlag: boolean;
    @Field(7, { presentWhen: i => !i.streamIdExtensionFlag }) streamIdExtension: number;
    @Field({ presentWhen: i => i.streamIdExtensionFlag }) trefExtension: TRefExtension;

    @Marker() $extensionEnd;
    @Field(i => i.extensionLength - i.measure(i => i.$extensionStart, i => i.$extensionEnd) / 8) 
    additionalBytes: Uint8Array;
}

export class TRefExtension extends BitstreamElement {
    @Reserved(6) $reserved;
    @Field(1) flag: boolean;
    @Field({ presentWhen: i => i.flag === false }) tref: TransportTimestamp;
}

export class ProgramPacketSequenceCounter extends BitstreamElement {
    @Field(1) readonly markerBit1 = 1 as const;
    @Field(7) value: number;
    @Field(1) readonly markerBit2 = 1 as const;

    /**
     * True if this PES packet contains information from an MPEG-2 stream, false if it contains information 
     * from an MPEG-1 stream (aka ISO 11172-1)
     * @see MPEG1_MPEG2_identifier on page 50, ISO 13818-1, ITU-T H.222.0 v9 (August 2023)
     */
    @Field(1) mpeg2: boolean;
    @Field(6) originalStuffLength: number;
}