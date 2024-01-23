export class TableId {
    /**
     * Get the name of the given table ID, if known. The names correspond
     * to the constants of the TableId class.
     * @param id 
     * @returns 
     */
    static getName(id: number) {
        return Object.entries(TableId).find(([k,v]) => v === id)[0];
    }

    static readonly PROGRAM_ASSOCATION = 0x00;
    static readonly CONDITIONAL_ACCESS = 0x01;
    static readonly TS_PROGRAM_MAP = 0x02;
    static readonly TS_DESCRIPTION = 0x03;
    static readonly ISO_IEC_14496_SCENE_DESCRIPTION = 0x04;
    static readonly ISO_IEC_14496_OBJECT_DESCRIPTOR = 0x05;
    static readonly METADATA = 0x06;
    static readonly IPMP_CONTROL_INFORMATION = 0x07;
    static readonly ISO_IEC_14496 = 0x08;
    static readonly ISO_IEC_23001_11 = 0x09;
    static readonly ISO_IEC_23001_10 = 0x0A;
    static readonly ISO_IEC_23001_13 = 0x0B;
    static readonly FORBIDDEN = 0xFF;
}