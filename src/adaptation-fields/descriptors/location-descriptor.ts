import { Field, Reserved, Variant } from "@astronautlabs/bitstream";
import { AFDescriptor } from "./af-descriptor";
import { TemiAnnouncement } from "./announcement";
import { BaseUrl } from "./base-url";
import { LocationAddon } from "./location-addon";

/**
 * Defines a Timeline and External Media Information (TEMI) Location descriptor
 */
@Variant(i => i.tag === 0x05)
export class LocationDescriptor extends AFDescriptor {
    @Field(1) forceReload: boolean;
    @Field(1) isAnnouncement: boolean;
    @Field(1) splicing: boolean;
    @Field(1) hasBaseUrl: boolean;
    @Reserved(5) reserved;
    @Field(7) timelineId: number;
    @Field(0, { presentWhen: i => i.isAnnouncement }) announcement: TemiAnnouncement;
    @Field(0, { presentWhen: i => i.hasBaseUrl }) baseUrl: BaseUrl;

    @Field(8, { array: { countFieldLength: 8 }}) addons: LocationAddon[];
}
