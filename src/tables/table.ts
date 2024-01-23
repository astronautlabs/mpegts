import { BitstreamElement, DefaultVariant, Field, Marker, Reserved, Variant, VariantMarker } from "@astronautlabs/bitstream";

export class Section extends BitstreamElement {
    @Field(8) tableId: number;
    @Field(1) sectionSyntaxIndicator: boolean;
    @Field(1) privateIndicator: boolean;
    @Reserved(2) private $reserved: number;
    @Field(12) length: number;
    @Marker() $sectionHeaderStart;
}

@Variant(i => i.sectionSyntaxIndicator && !i.privateIndicator)
export class PsiSection extends Section {
    readonly privateIndicator = false;

    /**
     * This is the 18 bit reserved section in many tables. In PAT/PMT it stores
     * the transport stream ID and program number, respectively. For implementation
     * simplicity it is allocated here in the general Section type and delegated out
     * with accessors in the subtypes.
     */
    @Reserved(18) protected identification: number;
    @Field(5) versionNumber: number;
    @Field(1) currentNextIndicator: boolean;
    @Field(8) sectionNumber: number;
    @Field(8) lastSectionNumber: number;
    @Marker() $sectionHeaderEnd;

    @VariantMarker() private $variantMarker;
    
    @Field(32) crc32: number;
}

@DefaultVariant()
export class UnknownPsiSection extends PsiSection {
    @TableData() data: Uint8Array;
}

interface TableShape extends BitstreamElement {
    length: number;
    $sectionHeaderStart;
    $sectionHeaderEnd;
    crc32: number;
}

export function TableData() {
    return Field<TableShape, any>(
        i => 
            i.length 
            - i.measure(i => i.$sectionHeaderStart, i => i.$sectionHeaderEnd) / 8
            - i.measureField(i => i.crc32) / 8
    );
}

export function TableEntries() {
    return Field<TableShape, any>({
        array: {
            hasMore: (array: BitstreamElement[], section: TableShape) => {
                let headerSize = section.length - section.measure(i => i.$sectionHeaderStart, i => i.$sectionHeaderEnd);
                let crcSize = section.measureField(i => i.crc32);
                let size = array.map(e => e.measure()).reduce((sum, v) => sum + v, 0);
                let available = section.length - headerSize - size - crcSize;
                return available > 0;
            }
        }
    });
}