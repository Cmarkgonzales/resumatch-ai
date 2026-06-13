import { create } from "zustand";
import { appConfig } from "./config";

declare global {
    interface Window {
        puter: {
            auth: {
                getUser: () => Promise<PuterUser>;
                isSignedIn: () => boolean | Promise<boolean>;
                signIn: (options?: PuterSignInOptions) => Promise<PuterSignInResult>;
                signOut: () => Promise<void>;
                getMonthlyUsage: () => Promise<PuterMonthlyUsage>;
            };
            fs: {
                write: (
                    path: string,
                    data: string | File | Blob,
                    options?: PuterFSWriteOptions
                ) => Promise<FSItem>;
                read: (path: string | PuterFSReadOptions) => Promise<Blob>;
                upload: (
                    items: FileList | File[] | Blob[],
                    dirPath?: string,
                    options?: PuterFSUploadOptions
                ) => Promise<FSItem | FSItem[]>;
                delete: (
                    paths: string | string[] | PuterFSDeleteOptions,
                    options?: Omit<PuterFSDeleteOptions, "paths">
                ) => Promise<void>;
                readdir: (path: string | PuterFSReadDirOptions) => Promise<FSItem[]>;
            };
            ai: {
                chat: (
                    prompt: string | ChatMessage[],
                    mediaOrOptions?: string | File | string[] | PuterChatOptions,
                    testMode?: boolean,
                    options?: PuterChatOptions
                ) => Promise<AIResponse>;
                img2txt: (
                    image: string | File | Blob | PuterImg2TxtOptions,
                    testModeOrOptions?: boolean | PuterImg2TxtOptions
                ) => Promise<string>;
            };
            kv: {
                get: (key: string) => Promise<PuterKVValue | null>;
                set: (
                    key: string,
                    value: PuterKVValue,
                    expireAt?: number
                ) => Promise<boolean>;
                del: (key: string) => Promise<boolean>;
                delete?: (key: string) => Promise<boolean>;
                list: {
                    (): Promise<string[]>;
                    (pattern: string): Promise<string[]>;
                    (returnValues: boolean): Promise<string[] | KVItem[]>;
                    (
                        pattern: string,
                        returnValues: boolean
                    ): Promise<string[] | KVItem[]>;
                    (options: KVListOptions): Promise<string[] | KVItem[] | KVListPage>;
                };
                flush: () => Promise<boolean>;
            };
        };
    }
}

interface PuterStore {
    isAuthenticating: boolean;
    error: string | null;
    puterReady: boolean;
    auth: {
        user: PuterUser | null;
        isAuthenticated: boolean;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
        refreshUser: () => Promise<void>;
        checkAuthStatus: () => Promise<boolean>;
        getMonthlyUsage: () => Promise<PuterMonthlyUsage | undefined>;
        getUser: () => PuterUser | null;
    };
    fs: {
        write: (
            path: string,
            data: string | File | Blob
        ) => Promise<FSItem | undefined>;
        read: (path: string) => Promise<Blob | undefined>;
        upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
        delete: (path: string) => Promise<void>;
        readDir: (path: string) => Promise<FSItem[] | undefined>;
    };
    ai: {
        chat: (
            prompt: string | ChatMessage[],
            imageURL?: string | File | string[] | PuterChatOptions,
            testMode?: boolean,
            options?: PuterChatOptions
        ) => Promise<AIResponse | undefined>;
        feedback: (
            message: string,
            media?: File | string
        ) => Promise<AIResponse | undefined>;
        img2txt: (
            image: string | File | Blob | PuterImg2TxtOptions,
            testModeOrOptions?: boolean | PuterImg2TxtOptions
        ) => Promise<string | undefined>;
    };
    kv: {
        get: (key: string) => Promise<PuterKVValue | null | undefined>;
        set: (
            key: string,
            value: PuterKVValue,
            expireAt?: number
        ) => Promise<boolean | undefined>;
        delete: (key: string) => Promise<boolean | undefined>;
        list: (
            pattern?: string | boolean | KVListOptions,
            returnValues?: boolean
        ) => Promise<string[] | KVItem[] | KVListPage | undefined>;
        flush: () => Promise<boolean | undefined>;
    };

    init: () => void;
    clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
    typeof window !== "undefined" && window.puter ? window.puter : null;

export const usePuterStore = create<PuterStore>((set, get) => {
    const setError = (msg: string) => {
        set({
            error: msg,
            isAuthenticating: false,
            auth: {
                user: null,
                isAuthenticated: false,
                signIn: get().auth.signIn,
                signOut: get().auth.signOut,
                refreshUser: get().auth.refreshUser,
                checkAuthStatus: get().auth.checkAuthStatus,
                getMonthlyUsage: get().auth.getMonthlyUsage,
                getUser: get().auth.getUser,
            },
        });
    };

    const checkAuthStatus = async (): Promise<boolean> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return false;
        }

        set({ isAuthenticating: true, error: null });

        try {
            const isSignedIn = await puter.auth.isSignedIn();
            if (isSignedIn) {
                const user = await puter.auth.getUser();
                set({
                    auth: {
                        user,
                        isAuthenticated: true,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getMonthlyUsage: get().auth.getMonthlyUsage,
                        getUser: () => user,
                    },
                    isAuthenticating: false,
                });
                return true;
            } else {
                set({
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        signIn: get().auth.signIn,
                        signOut: get().auth.signOut,
                        refreshUser: get().auth.refreshUser,
                        checkAuthStatus: get().auth.checkAuthStatus,
                        getMonthlyUsage: get().auth.getMonthlyUsage,
                        getUser: () => null,
                    },
                    isAuthenticating: false,
                });
                return false;
            }
        } catch (err) {
            const msg =
                err instanceof Error ? err.message : "Failed to check auth status";
            setError(msg);
            return false;
        }
    };

    const signIn = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isAuthenticating: true, error: null });

        try {
            await puter.auth.signIn();
            await checkAuthStatus();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign in failed";
            setError(msg);
        }
    };

    const signOut = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isAuthenticating: true, error: null });

        try {
            await puter.auth.signOut();
            set({
                auth: {
                    user: null,
                    isAuthenticated: false,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getMonthlyUsage: get().auth.getMonthlyUsage,
                    getUser: () => null,
                },
                isAuthenticating: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Sign out failed";
            setError(msg);
        }
    };

    const refreshUser = async (): Promise<void> => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        set({ isAuthenticating: true, error: null });

        try {
            const user = await puter.auth.getUser();
            set({
                auth: {
                    user,
                    isAuthenticated: true,
                    signIn: get().auth.signIn,
                    signOut: get().auth.signOut,
                    refreshUser: get().auth.refreshUser,
                    checkAuthStatus: get().auth.checkAuthStatus,
                    getMonthlyUsage: get().auth.getMonthlyUsage,
                    getUser: () => user,
                },
                isAuthenticating: false,
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to refresh user";
            setError(msg);
        }
    };

    const init = (): void => {
        const puter = getPuter();
        if (puter) {
            set({ puterReady: true });
            checkAuthStatus();
            return;
        }

        const interval = setInterval(() => {
            if (getPuter()) {
                clearInterval(interval);
                set({ puterReady: true });
                checkAuthStatus();
            }
        }, appConfig.puter.initPollMs);

        setTimeout(() => {
            clearInterval(interval);
            if (!getPuter()) {
                setError(
                    `Puter.js failed to load within ${
                        appConfig.puter.initTimeoutMs / 1000
                    } seconds`
                );
            }
        }, appConfig.puter.initTimeoutMs);
    };

    const getMonthlyUsage = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        return puter.auth.getMonthlyUsage();
    };

    const write = async (path: string, data: string | File | Blob) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.write(path, data);
    };

    const readDir = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.readdir(path);
    };

    const readFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.read(path);
    };

    const upload = async (files: File[] | Blob[]) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        const uploaded = await puter.fs.upload(files);
        return Array.isArray(uploaded) ? uploaded[0] : uploaded;
    };

    const deleteFile = async (path: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.fs.delete(path);
    };

    const chat = async (
        prompt: string | ChatMessage[],
        imageURL?: string | File | string[] | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.ai.chat(prompt, imageURL, testMode, options) as Promise<
            AIResponse | undefined
        >;
    };

    const feedback = async (message: string, media?: File | string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }

        if (media) {
            return puter.ai.chat(
                message,
                media,
                false,
                { model: appConfig.ai.feedbackModel }
            ) as Promise<AIResponse | undefined>;
        }

        return puter.ai.chat(message, { model: appConfig.ai.feedbackModel }) as Promise<
            AIResponse | undefined
        >;
    };

    const img2txt = async (
        image: string | File | Blob | PuterImg2TxtOptions,
        testModeOrOptions?: boolean | PuterImg2TxtOptions
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.ai.img2txt(image, testModeOrOptions);
    };

    const getKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.get(key);
    };

    const setKV = async (key: string, value: PuterKVValue, expireAt?: number) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.set(key, value, expireAt);
    };

    const deleteKV = async (key: string) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.del(key);
    };

    const listKV = async (
        pattern?: string | boolean | KVListOptions,
        returnValues?: boolean
    ) => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        if (pattern === undefined) {
            return puter.kv.list();
        }

        if (typeof pattern === "boolean") {
            return puter.kv.list(pattern);
        }

        if (typeof pattern === "object") {
            return puter.kv.list(pattern);
        }

        return puter.kv.list(pattern, returnValues ?? false);
    };

    const flushKV = async () => {
        const puter = getPuter();
        if (!puter) {
            setError("Puter.js not available");
            return;
        }
        return puter.kv.flush();
    };

    return {
        isAuthenticating: true,
        error: null,
        puterReady: false,
        auth: {
            user: null,
            isAuthenticated: false,
            signIn,
            signOut,
            refreshUser,
            checkAuthStatus,
            getMonthlyUsage,
            getUser: () => get().auth.user,
        },
        fs: {
            write: (path: string, data: string | File | Blob) => write(path, data),
            read: (path: string) => readFile(path),
            readDir: (path: string) => readDir(path),
            upload: (files: File[] | Blob[]) => upload(files),
            delete: (path: string) => deleteFile(path),
        },
        ai: {
            chat: (
                prompt: string | ChatMessage[],
                imageURL?: string | File | string[] | PuterChatOptions,
                testMode?: boolean,
                options?: PuterChatOptions
            ) => chat(prompt, imageURL, testMode, options),
            feedback: (message: string, media?: File | string) => feedback(message, media),
            img2txt: (
                image: string | File | Blob | PuterImg2TxtOptions,
                testModeOrOptions?: boolean | PuterImg2TxtOptions
            ) => img2txt(image, testModeOrOptions),
        },
        kv: {
            get: (key: string) => getKV(key),
            set: (key: string, value: PuterKVValue, expireAt?: number) =>
                setKV(key, value, expireAt),
            delete: (key: string) => deleteKV(key),
            list: (pattern?: string | boolean | KVListOptions, returnValues?: boolean) =>
                listKV(pattern, returnValues),
            flush: () => flushKV(),
        },
        init,
        clearError: () => set({ error: null }),
    };
});
