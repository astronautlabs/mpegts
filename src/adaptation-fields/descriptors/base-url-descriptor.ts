import { Field, Variant } from "@astronautlabs/bitstream";
import { AFDescriptor } from "./af-descriptor";

@Variant(i => i.tag === 0x06)
export class BaseUrlDescriptor extends AFDescriptor {
    /**
     * See TEMI_URL_SCHEME_* constants
     */
    @Field(8) scheme: number;
    @Field((i: BaseUrlDescriptor) => i.length - 1, { string: { encoding: 'ascii' }}) path: string;
}
