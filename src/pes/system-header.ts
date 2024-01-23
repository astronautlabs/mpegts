import { BitstreamElement, BitstreamReader, BitstreamWriter, Field, FieldDefinition, IncompleteReadResult, Reserved, Serializer, StructureSerializer, Variant, VariantMarker } from "@astronautlabs/bitstream";
import { PStdBuffer } from "./p-std-buffer";

class StreamConfigurationArraySerializer implements Serializer {
    *read(
        reader: BitstreamReader, 
        type: typeof BitstreamElement, 
        parent: BitstreamElement, 
        field: FieldDefinition<BitstreamElement, any>
    ): Generator<IncompleteReadResult, any, unknown> {
        let elements: BitstreamElement[] = [];

        do {
            if (reader.available === 0)
                yield { remaining: 1, contextHint: () => `[StreamConfiguration[] serializer]`, optional: true };

            if (reader.available === 0 || reader.peekSync(1) !== 1)
                break;

            let element : BitstreamElement;
            let serializer = new StructureSerializer();
            let gen = serializer.read(reader, type, parent, field);
            
            while (true) {
                let result = gen.next();
                if (result.done === false) {
                    yield result.value;
                } else {
                    element = result.value;
                    break;
                }
            }

            elements.push(element);
        } while (true);

        return elements;
    }

    *write(writer: BitstreamWriter, type: Function, parent: BitstreamElement, field: FieldDefinition<BitstreamElement, any>, elements: BitstreamElement[]) {
        for (let element of elements)
            element.write(writer, { context: parent?.context });
    }
}

/**
 * @see system_header
 */
export class SystemHeader extends BitstreamElement {
    static readonly START_CODE = 0x000001BB;
    
    @Field(32) systemHeaderStartCode: number;
    @Field(16) headerLength: number;
    @Reserved(1) private $markerBit: boolean;
    @Field(22) rateBound: number;
    @Reserved(1) private $markerBit2: boolean;
    @Field(6) audioBound: number;
    @Field(1) fixedFlag: boolean;
    @Field(1) cspsFlag: boolean;
    @Field(1) systemAudioLockFlag: boolean;
    @Field(1) systemVideoLockFlag: boolean;
    @Reserved(1) private $markerBit3: boolean;
    @Field(5) videoBound: number;
    @Field(1) packetRateRestrictionFlag: boolean;
    @Reserved(7) private $reservedBits: number;
    @Field({ serializer: new StreamConfigurationArraySerializer() }) 
    readonly streamConfigurations: StreamConfiguration[] = [];
}

export class StreamConfiguration extends BitstreamElement {
    @Field(8) streamId: number;

    @VariantMarker() private $variantMarker;

    @Field() pStdBuffer: PStdBuffer;
}

@Variant(i => i.streamId === 0b1011_0111)
export class ExtendedStreamConfiguration extends StreamConfiguration {
    @Field(2) private $fixedBits2 = 0b11 as const;
    @Field(7) private $fixedBits3 = 0b000_0000 as const;
    @Field(7) streamIdExtension: number;
    @Field(8) private $fixedBits4 = 0b1011_0110 as const;
}
