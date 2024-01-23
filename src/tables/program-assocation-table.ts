import { BitstreamElement, Field, Marker, Reserved, Variant } from '@astronautlabs/bitstream';
import { PsiSection, TableEntries } from './table';
import { TableId } from './table-id';

/**
 * @see program_association_section
 */
@Variant(i => i.tableId === TableId.PROGRAM_ASSOCATION)
export class ProgramAssociationSection extends PsiSection {
    get transportStreamId() { return this.identification >> 2; }
    set transportStreamId(value) { this.identification = value << 2 | 0b11; }
    
    @TableEntries() entries: ProgramAssociationEntry[] = [];
}

export class ProgramAssociationEntry extends BitstreamElement {
    @Field(16) programNumber: number;
    @Reserved(3) private $reserved: number;
    @Field(13) pid: number;
}