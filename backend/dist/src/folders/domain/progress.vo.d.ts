export declare class Progress {
    readonly value: number;
    private constructor();
    static of(n: number): Progress;
    static zero(): Progress;
    static fromRatio(done: number, total: number): Progress;
    isComplete(): boolean;
}
