import {
    BitstreamElement, BitstreamReader, BitstreamWriter, DefaultVariant, Field, FieldDefinition,
    IncompleteReadResult, Marker, Serializer, StructureSerializer
} from "@astronautlabs/bitstream";

export class Descriptor extends BitstreamElement {
    @Field(8) tag: number;
    @Field(8) length: number;
    @Marker() $payloadStart;
}

@DefaultVariant()
export class UnknownDescriptor extends Descriptor {
    @Field(i => i.length) data: Uint8Array;
}

export class DescriptorSetSerializer implements Serializer {
    *read(reader: BitstreamReader, type: typeof Array, parent: BitstreamElement, field: FieldDefinition<BitstreamElement, any>): Generator<IncompleteReadResult, any, unknown> {

        if (reader.available < 12)
            yield { remaining: 12 - reader.available, contextHint: () => `[descriptor set serializer]` };

        let length = reader.readSync(12);
        let descriptors: Descriptor[] = [];

        let structureSerializer = new StructureSerializer();
        let offset = reader.offset;

        while ((reader.offset - offset) / 8 < length) {
            let gen = structureSerializer.read(reader, Descriptor, parent, field);
            let descriptor: Descriptor;

            while (true) {
                let result = gen.next();
                if (result.done === false) {
                    yield result.value;
                } else {
                    descriptor = result.value;
                    break;
                }
            }

            descriptors.push(descriptor);
        }

        return descriptors;
    }

    write(writer: BitstreamWriter, type: Function, parent: BitstreamElement, field: FieldDefinition<BitstreamElement, any>, descriptors: Descriptor[]) {
        let length = descriptors.map(v => v.measure()).reduce((sum, v) => sum + v, 0) / 8;
        writer.write(12, length);
        for (let descriptor of descriptors) {
            descriptor.write(writer);
        }
    }

}

const DESCRIPTOR_SET_SERIALIZER = new DescriptorSetSerializer();
export function DescriptorSet() {
    return Field<BitstreamElement, any>({
        serializer: DESCRIPTOR_SET_SERIALIZER
    });
}
