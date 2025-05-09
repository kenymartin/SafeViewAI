declare module 'ps-node' {
  interface Process {
    pid: number;
    ppid: number;
    command: string;
    arguments: string[];
  }

  interface LookupOptions {
    command?: string;
    ppid?: number;
    psargs?: string;
  }

  interface PS {
    lookup(options: LookupOptions, callback: (err: Error | null, resultList: Process[]) => void): void;
  }

  const ps: PS;
  export = ps;
} 