import { BitstreamElement, Field } from "@astronautlabs/bitstream";
import { PREFIXED_STRING } from "../../prefixed-string-serializer";

export const TEMI_URL_SCHEME_INFERRED = 0;
export const TEMI_URL_SCHEME_HTTP = 1;
export const TEMI_URL_SCHEME_HTTPS = 2;

export class BaseUrl extends BitstreamElement {
    /**
     * See TEMI_URL_SCHEME_* constants
     */
    @Field(8) scheme: number;
    @Field(0, { serializer: PREFIXED_STRING }) path: string;
}
