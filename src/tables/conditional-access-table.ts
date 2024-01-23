import { Field, Marker, Reserved, Variant } from '@astronautlabs/bitstream';
import { Descriptor, DescriptorTag } from '../descriptors';
import { PsiSection, TableEntries } from './table';

/**
 * @see CA_section
 */
export class CaSection extends PsiSection {
    @TableEntries() descriptors: CaDescriptor[] = [];
}

/**
 * @see CA_descriptor
 */
@Variant(i => i.tag === DescriptorTag.CONDITIONAL_ACCESS)
export class CaDescriptor extends Descriptor {
    @Field(16) systemId: number;
    @Reserved(3) private $reserved: number;
    @Field(13) pid: number;

    @Marker() $dataStart;

    @Field(i => i.length - i.measure(i => i.$payloadStart, i => i.$dataStart)) 
    data: Uint8Array;
}