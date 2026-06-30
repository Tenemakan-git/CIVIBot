export type Outcome<T, E = string> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export declare const ok: <T>(value: T) => Outcome<T, never>;
export declare const fail: <E>(error: E) => Outcome<never, E>;
export declare const isOk: <T, E>(o: Outcome<T, E>) => o is {
    ok: true;
    value: T;
};
