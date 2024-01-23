import { Field, Reserved, Variant } from "@astronautlabs/bitstream";
import { AFDescriptor } from "./af-descriptor";
import { Timecode, Timecode2 } from "../timecode";
import { PTPTimestamp } from "./ptp-timestamp";
import { MediaTimestamp, MediaTimestamp2 } from "./media-timestamp";
import { NTPTimestamp } from "./ntp-timestamp";

@Variant(i => i.tag === 0x04)
export class TimelineDescriptor extends AFDescriptor {
    @Field(2, { writtenValue: i => i.timestamp2 ? 2 : i.timestamp ? 1 : 0 })    hasTimestamp: number;
    @Field(1, { writtenValue: i => !!i.ntpTimestamp })                          hasNTP: boolean;
    @Field(1, { writtenValue: i => !!i.ptpTimestamp })                          hasPTP: boolean;
    @Field(2, { writtenValue: i => i.timecode2 ? 2 : i.timecode ? 1 : 0 })      hasTimecode: number;
    @Field(1) forceReload: boolean;
    @Field(1) paused: boolean;
    @Field(1) discontinuity: boolean;
    @Reserved(7) reserved: boolean;
    @Field(8) timelineId: number;

    @Field(0, { presentWhen: i => i.hasTimestamp === 1 })   timestamp: MediaTimestamp;
    @Field(0, { presentWhen: i => i.hasTimestamp === 2 })   timestamp2: MediaTimestamp2;
    @Field(0, { presentWhen: i => i.hasNTP })               ntpTimestamp: NTPTimestamp;
    @Field(0, { presentWhen: i => i.hasPTP })               ptpTimestamp: PTPTimestamp;
    
    @Field(0, { presentWhen: i => i.hasTimecode === 1 })   timecode: Timecode;
    @Field(0, { presentWhen: i => i.hasTimecode === 2 })   timecode2: Timecode2;
}