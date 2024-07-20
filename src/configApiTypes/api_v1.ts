

type ApiDiscordChannel = {
    name: string,
    id: string,
    type: "voice" | "text" | "thread" | "unknown"
}

type ApiDiscordUser = {
    name: string,
    id: string,
    icon: string | null
}
type ApiDiscordMember = {
    username: string,
    id: string,
    icon: string | null,
    globalName: string,
    nickname: string | null,
}

type ApiDiscordChannelList = {
    complete: boolean,
    count: number,
    total: number,
    channels: ApiDiscordChannel[]
}

type ApiDiscordMemberList = {
    /** Is this is a complete list? (true means there is no need for further searching) */
    complete: boolean,
    /** How many were returned */
    count: number,
    /** How many are there? */
    total: number,
    members: ApiDiscordMember[]
}

enum ConfigValueType {
    string,
    number,
    integer,
    user,
    channel,
    member,
    object,
    boolean
}


type ReturnValueType<Type extends ConfigValueType> = 
    Type extends ConfigValueType.string                             ? string
    : Type extends ConfigValueType.number | ConfigValueType.integer ? number
    : Type extends ConfigValueType.user                             ? ApiDiscordUser
    : Type extends ConfigValueType.member                           ? ApiDiscordMember
    : Type extends ConfigValueType.channel                          ? ApiDiscordChannel
    : Type extends ConfigValueType.object                           ? any
    : Type extends ConfigValueType.boolean                          ? boolean
    : never;

type RealValueType<Type extends ConfigValueType> = 
    Type extends ConfigValueType.number | ConfigValueType.integer ? number
    : Type extends ConfigValueType.boolean                          ? boolean
    : Type extends ConfigValueType.object                         ? any
    : string;

type ConfigValueBase<Type extends ConfigValueType> = {
    /** Name of the value, displayed in settings UI */
    displayName: string,
    /** Description of the value, displayed in settings UI */
    description: string,
    /** If value should be visible in UI */
    uiVisibility?: "visible" | "readonly" | "hidden",
    /** Type of the value */
    type: Type,
} & ({
    /** Should this be an array of values? */
    array: true,
    /** Default value */
    default?: RealValueType<Type>[]
    /** Max number of values in the array */
    maxCount?: number,
    /** Array of values */
    value: ReturnValueType<Type>[] | null
} | {
    array?: false | undefined,
    /** Default value */
    default?: RealValueType<Type>
    /** Value */
    value: ReturnValueType<Type> | null;
})


type ConfigValueString = ConfigValueBase<ConfigValueType.string> & {
    /** Max length of the string */
    maxLength?: number,
    /** Min lenght of the string */
    minLength?: number,
    /** Choices for the string value (restrict to only these) */
    choices?: string[]
}

type ConfigValueNumber = ConfigValueBase<ConfigValueType.number> & {
    /** Max value of the number */
    maxValue?: number,
    /** Min value of the number */
    minValue?: number,
    /** Choices for the number value (restrict to only these) */
    choices?: number[]
}

type ConfigValueInteger = ConfigValueBase<ConfigValueType.integer> & {
    /** Max value of the integer */
    maxValue?: number,
    /** Min value of the integer */
    minValue?: number,
    /** Choices for the integer value (restrict to only these) */
    choices?: number[],
}

type ConfigValueUser = ConfigValueBase<ConfigValueType.user>;
type ConfigValueChannel = ConfigValueBase<ConfigValueType.channel>;
type ConfigValueMember = ConfigValueBase<ConfigValueType.member>;

type ConfigValueObject = ConfigValueBase<ConfigValueType.object> & {
    children: any;
}

type ConfigValueBoolean = ConfigValueBase<ConfigValueType.boolean>;

type ApiConfigValue = ConfigValueString | ConfigValueNumber | ConfigValueInteger | ConfigValueUser | ConfigValueChannel | ConfigValueMember | ConfigValueObject | ConfigValueBoolean;

type Module = {
    module: string,
    displayName: string,
    values: ApiConfigValue[]
}

type SettingsList = Module[]

type ValueEdits = {
    [name: string]: RealValueType<ConfigValueType>
}

enum ValueValidationResult {
    valid = "valid",
    invalid_module = "invalid_module",
    invalid_name = "invalid_name",
    invalid_type = "invalid_type",
    invalid_value = "invalid_value",
    readonly_value = "readonly_value",
    no_permission = "no_permission",
}
type ValueValidationResults = {
    [key: string]: ValueValidationResult;
}
type ValueEditResult = {
    success: boolean,
    results: ValueValidationResults
}

type ApiGuild = {
    id: string,
    name: string,
    nameAcronym: string,
    iconUrl: string | null
}

enum ApiErrorType {
    fastify_error = "fastify_error",
    not_found = "not_found",
    unknown_error = "unknown_error",
    no_permission = "no_permission",
    invalid_snowflake = "invalid_snowflake",
    member_not_found = "member_not_found",
    guild_not_found = "guild_not_found",
    module_not_found = "module_not_found",
    invalid_edits = "invalid_edits",
}

type ApiError = {
    /** HTTP status code */
    readonly statusCode: number;
    /** Readable name for the error */
    readonly error: string;
    /** Readable message */
    readonly message: string;
    /** raw error (if any) */
    readonly raw?: string;
    /** Type of error */
    readonly type: ApiErrorType;
}


export type { SettingsList, ApiConfigValue, ValueEdits, ValueEditResult, ApiGuild, ApiError, ApiDiscordUser, ApiDiscordMember, ApiDiscordMemberList, ApiDiscordChannel, ApiDiscordChannelList }
export { ApiErrorType, ValueValidationResults, ValueValidationResult, ConfigValueType }