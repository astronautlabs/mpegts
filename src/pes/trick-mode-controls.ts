import { BitstreamElement, DefaultVariant, Field, Reserved, Variant } from "@astronautlabs/bitstream";

export class TrickModeControl extends BitstreamElement {
    static readonly FAST_FORWARD = 0b000;
    static readonly SLOW_MOTION = 0b001;
    static readonly FREEZE_FRAME = 0b010;
    static readonly FAST_REVERSE = 0b011;
    static readonly SLOW_REVERSE = 0b100;

    /**
     * @see trick_mode_control (page 40, ISO/IEC 13818-1, ITU-T H.222.0 v9, August 2023)
     */
    @Field(3) type: number;
}

@Variant(i => i.type === TrickModeControl.FAST_FORWARD)
export class FastForwardControl extends TrickModeControl {
    @Field(2) fieldId: number;
    @Field(1) intraSliceRefresh: boolean;
    @Field(2) frequencyTruncation: number;
}

@Variant(i => i.type === TrickModeControl.SLOW_MOTION)
export class SlowMotionControl extends TrickModeControl {
    @Field(5) repetitions: number;
}

@Variant(i => i.type === TrickModeControl.FREEZE_FRAME)
export class FreezeFrameControl extends TrickModeControl {
    @Field(2) fieldId: number;
    @Reserved(3) $reserved: unknown;
}

@Variant(i => i.type === TrickModeControl.FAST_REVERSE)
export class FastReverseControl extends TrickModeControl {
    @Field(2) fieldId: number;
    @Field(1) intraSliceRefresh: boolean;
    @Field(2) frequencyTruncation: number;
}

@Variant(i => i.type === TrickModeControl.SLOW_REVERSE)
export class SlowReverseControl extends TrickModeControl {
    @Field(5) repetitions: number;
}

@DefaultVariant()
export class UnknownTrickModeControl extends TrickModeControl {
    @Field(5) $reserved: unknown;
}