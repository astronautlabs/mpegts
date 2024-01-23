import { BitstreamElement, Field, Marker, Reserved, Variant } from '@astronautlabs/bitstream';
import { PsiSection, TableEntries } from './table';
import { Descriptor, DescriptorSet } from '../descriptors';
import { TableId } from './table-id';

/**
 * @see program_map_section
 */
@Variant(i => i.tableId === TableId.TS_PROGRAM_MAP)
export class ProgramMapSection extends PsiSection {
    get programNumber() { return this.identification >> 2; }
    set programNumber(value) { this.identification = value << 2 | 0b11; }
    
    @Reserved(3) private $reserved3: number;
    @Field(13) pcrPid: number;
    @Reserved(4) private $reserved4: number;
    @DescriptorSet() programInfo: Descriptor[];
    @TableEntries() entries: ProgramMapEntry[] = [];
}

export class ProgramMapEntry extends BitstreamElement {
    @Field(8) streamType: number;
    @Reserved(3) private $reserved5: number;
    @Field(13) pid: number;
    @Reserved(4) private $reserved6: number;
    @DescriptorSet() esInfo: Descriptor[];
}