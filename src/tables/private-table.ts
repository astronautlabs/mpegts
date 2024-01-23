import { DefaultVariant, Field, Marker, Reserved, Variant, VariantMarker } from "@astronautlabs/bitstream";
import { Section, TableData } from "./table";

@Variant(i => i.privateIndicator)
export class PrivateSection extends Section {
}

@DefaultVariant()
export class UnknownPrivateSection extends PrivateSection {
    @Field(i => i.length)
    data: Uint8Array;
}

@Variant(i => i.sectionSyntaxIndicator)
export class SyntacticPrivateSection extends PrivateSection {
    @Field(16) programNumber: number;
    @Reserved(2) private $reserved2: number;
    @Field(5) versionNumber: number;
    @Field(1) currentNextIndicator: boolean;
    @Field(8) sectionNumber: number;
    @Field(8) lastSectionNumber: number;
    @Marker() $sectionHeaderEnd;

    @VariantMarker() private $variantMarker;
    
    @Field(32) crc32: number;
}

@DefaultVariant()
export class UnknownSyntacticPrivateSection extends SyntacticPrivateSection {
    @TableData() data: Uint8Array;
}