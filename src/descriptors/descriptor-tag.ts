export class DescriptorTag {
    /**
     * Retrieve the name of the given tag, if known. The name
     * corresponds to the static constants of the DescriptorTag
     * class.
     * 
     * @param tag 
     */
    static getName(tag: number) {
        Object.entries(DescriptorTag).find(([k,v]) => tag === v)[0];
    }

    static readonly RESERVED = 0;
    static readonly FORBIDDEN = 1;
    static readonly VIDEO_STREAM = 2;
    static readonly AUDIO_STREAM = 3;
    static readonly HEIRARCHY = 4;
    static readonly REGISTRATION = 5;
    static readonly DATA_STREAM_ALIGNMENT = 6;
    static readonly TARGET_BACKGROUND_GRID = 7;
    static readonly VIDEO_WINDOW = 8;
    static readonly CONDITIONAL_ACCESS = 9;
    static readonly ISO_639_LANGUAGE = 10;
    static readonly SYSTEM_CLOCK = 11;
    static readonly MULTIPLEX_BUFFER_UTILIZATION = 12;
    static readonly COPYRIGHT = 13;
    static readonly MAXIMUM_BITRATE = 14;
    static readonly PRIVATE_DATA_INDICATOR = 15;
    static readonly SMOOTHING_BUFFER = 16;
    static readonly STD = 17;
    static readonly IBP = 18;

    static readonly MPEG4_VIDEO = 27;
    static readonly MPEG4_AUDIO = 28;
    static readonly IOD = 29;
    static readonly SL = 30;
    static readonly FMC = 31;
    static readonly EXTERNAL_ES_ID = 32;
    static readonly MUX_CODE = 33;
    static readonly M4_MUX_BUFFER_SIZE = 34;
    static readonly MULTIPLEX_BUFFER = 35;
    static readonly CONTENT_LABELING = 36;
    static readonly METADATA_POINTER = 37;
    static readonly METADATA = 38;
    static readonly METADATA_STD = 39;
    static readonly AVC_VIDEO = 40;
    static readonly IPMP = 41;
    static readonly AVC_TIMING_AND_HRD = 42;
    static readonly MPEG2_AAC_AUDIO = 43;
    static readonly M4_MUX_TIMING = 44;
    static readonly MPEG4_TEXT = 45;
    static readonly MPEG4_AUDIO_EXTENSION = 46;
    static readonly AUXILIARY_VIDEO_STREAM = 47;
    static readonly SVC_EXTENSION = 48;
    static readonly MVC_EXTENSION = 49;
    static readonly J2K_VIDEO = 50;
    static readonly MVC_OPERATION_POINT = 51;
    static readonly MPEG2_STEREOSCOPIC_VIDEO_FORMAT = 52;
    static readonly STEREOSCOPIC_PROGRAM_INFO = 53;
    static readonly STEREOSCOPIC_VIDEO_INFO = 54;
    static readonly TRANSPORT_PROFILE = 55;
    static readonly HEVC_VIDEO = 56;
    static readonly VVC_VIDEO = 57;
    static readonly EVC_VIDEO = 58;
}