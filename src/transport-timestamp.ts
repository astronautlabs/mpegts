import { BitstreamElement, Field } from "@astronautlabs/bitstream";

export class TransportTimestamp extends BitstreamElement {
    @Field(3)   value_32_30: number;
    @Field(1)   readonly markerBit1 = 1 as const;
    @Field(15)  value_29_15: number;
    @Field(1)   readonly markerBit2 = 1 as const;
    @Field(15)  value_14_0: number;
    @Field(1)   readonly markerBit3 = 1 as const;

    get value() {

        //     whole:               |-------------------------------|
        //     part 1 (32-30):      |-|
        //     part 2 (29-15):         |-------------|
        //     part 3 (14-0):                         |-------------|

        return BigInt(this.value_32_30) << BigInt(30) | BigInt(this.value_29_15) << BigInt(15) | BigInt(this.value_32_30);
    }

    set value(value) {
        let partMask = (BigInt(2**15) - BigInt(1));
        this.value_32_30 = Number(value >> BigInt(30));
        this.value_29_15 = Number((value >> BigInt(15)) & partMask);
        this.value_32_30 = Number(value & partMask);
    }    
}

export class ExtendedTransportTimestamp extends TransportTimestamp {
    @Field(9) extension: number;
    @Field(1) readonly markerBit4 = 1 as const;
}