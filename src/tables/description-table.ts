import { BitstreamElement, Field, Marker, Reserved, Variant } from '@astronautlabs/bitstream';
import { PsiSection, TableEntries } from './table';
import { TableId } from './table-id';
import { Descriptor } from '../descriptors';

/**
 * @see TS_description_section
 */
@Variant(i => i.tableId === TableId.TS_DESCRIPTION)
export class DescriptionSection extends PsiSection {
    @TableEntries() descriptors: Descriptor[] = [];
}