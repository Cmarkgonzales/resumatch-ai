interface FSItem {
    id: string;
    uid: string;
    name: string;
    path: string;
    is_dir: boolean;
    parent_id: string;
    parent_uid: string;
    created: number;
    modified: number;
    accessed: number;
    size: number | null;
    writable: boolean;
}

interface PuterUser {
    uuid: string;
    username: string;
}

interface PuterSignInOptions {
    attempt_temp_user_creation?: boolean;
}

interface PuterSignInResult {
    user?: PuterUser;
}

interface PuterMonthlyUsage {
    allowanceInfo: {
        monthUsageAllowance: number;
        remaining: number;
    };
    appTotals: Record<
        string,
        {
            count: number;
            total: number;
        }
    >;
    usage: Record<
        string,
        {
            cost: number;
            count: number;
            units: number;
        }
    >;
}

type PuterKVValue =
    | string
    | number
    | boolean
    | null
    | PuterKVValue[]
    | { [key: string]: PuterKVValue };

interface KVItem {
    key: string;
    value: PuterKVValue;
}

interface KVListOptions {
    pattern?: string;
    returnValues?: boolean;
    limit?: number;
    cursor?: string;
}

interface KVListPage {
    items: string[] | KVItem[];
    cursor?: string;
    hasMore?: boolean;
}

interface PuterFSWriteOptions {
    overwrite?: boolean;
    dedupeName?: boolean;
    createMissingParents?: boolean;
}

interface PuterFSUploadOptions {
    overwrite?: boolean;
    dedupeName?: boolean;
    createMissingParents?: boolean;
}

interface PuterFSReadOptions {
    path: string;
    offset?: number;
    byte_count?: number;
}

interface PuterFSReadDirOptions {
    path: string;
    uid?: string;
}

interface PuterFSDeleteOptions {
    paths: string | string[];
    recursive?: boolean;
    descendantsOnly?: boolean;
}

interface ChatMessageContent {
    type: "file" | "text";
    puter_path?: string;
    text?: string;
}

interface ChatMessage {
    role: "user" | "assistant" | "system" | "tool";
    content: string | ChatMessageContent[];
}

interface PuterImg2TxtOptions {
    source?: string | File | Blob;
    provider?: "aws-textract" | "mistral" | string;
    model?: string;
    testMode?: boolean;
    pages?: number[];
    includeImageBase64?: boolean;
    imageLimit?: number;
    imageMinSize?: number;
    bboxAnnotationFormat?: string;
    documentAnnotationFormat?: string;
}

interface PuterChatOptions {
    model?: string;
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    tools?: {
        type: "function";
        function: {
            name: string;
            description: string;
            parameters: { type: string; properties: {} };
        }[];
    };
}

interface AIResponse {
    index: number;
    message: {
        role: string;
        content: string | any[];
        refusal: null | string;
        annotations: any[];
    };
    logprobs: null | any;
    finish_reason: string;
    usage: {
        type: string;
        model: string;
        amount: number;
        cost: number;
    }[];
    via_ai_chat_service: boolean;
}
