import { BitstreamElement, Field } from "@astronautlabs/bitstream";
import { PREFIXED_STRING } from "../../prefixed-string-serializer";

export const TEMI_SERVICE_TYPE_MIME = 0;
export const TEMI_SERVICE_TYPE_MPEG_DASH = 1;
export const TEMI_SERVICE_TYPE_ISO_14496_12 = 2;
export const TEMI_SERVICE_TYPE_MPEG_TS = 3;
export const TEMI_SERVICE_TYPE_UNKNOWN = 0x7F;

export class LocationAddon extends BitstreamElement {
    /**
     * See TEMI_SERVICE_TYPE_* constants
     */
    @Field(8) serviceType: number;
    @Field(0, { presentWhen: i => i.serviceType === 0, serializer: PREFIXED_STRING }) mimeType: string;
    @Field(0, { serializer: PREFIXED_STRING }) location: string;
}
