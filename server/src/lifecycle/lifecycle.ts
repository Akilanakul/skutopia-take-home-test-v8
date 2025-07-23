let running = true;
const closeListeners: Array<() => Promise<unknown> | unknown> = [];

export const lifecycle = {
  isOpen: () => running,
  on: (_: 'close', listener: () => Promise<unknown> | unknown) =>
    closeListeners.push(listener),
  close: async (exitCode = 0) => {
    if (running) {
      running = false;
      await Promise.allSettled(closeListeners.map((listener) => listener()));

      process.exitCode = exitCode;
    }
  },
  _reopenAfterTest: () => {
    running = true;
  },
};
