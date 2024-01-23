import { BitstreamElement, BitstreamReader, BitstreamWriter, FieldDefinition, IncompleteReadResult, Serializer } from "@astronautlabs/bitstream";
import { summarizeField } from "./utils";

export class PrefixedStringSerializer implements Serializer {
    *read(reader: BitstreamReader, type: any, parent: BitstreamElement, field: FieldDefinition): Generator<IncompleteReadResult, any, unknown> {
        
        if (!reader.isAvailable(8))
            yield { remaining: 8, contextHint: () => summarizeField(field) };
            
        let length = reader.readSync(8);
        
        if (!reader.isAvailable(length*8))
            yield { remaining: length*8, contextHint: () => summarizeField(field) };
            
        let string = reader.readStringSync(length, { encoding: 'ascii', nullTerminated: false });

        return string;
    }

    write(writer: BitstreamWriter, type: any, parent: BitstreamElement, field: FieldDefinition, value: string) {
        if (value.length > 255)
            throw new Error(`String must be less than 256 characters (received ${value.length})`);
        writer.write(8, value.length);
        writer.writeString(value.length, value, 'ascii');
    }
}

export const PREFIXED_STRING = new PrefixedStringSerializer();
