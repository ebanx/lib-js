declare const Cardinal: {
  configure(options: unknown): void;
  setup(funcName: string, options: unknown): void;
  trigger(funcName: string, options: unknown): void;
  on(funcName: string, options: unknown): void;
  continue(funcName: string, options: unknown, order: unknown): void;
};
