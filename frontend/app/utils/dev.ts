const flags = {
  'mock-msg': import.meta.env.VITE_DEV_MSG?.toLowerCase() === 'true'
};

export function dev(flag?: keyof typeof flags): boolean {
  if (!import.meta.env.VITE_DEV) {
    return false;
  }

  if (flag) {
    return flags[flag];
  }

  return true;
}

const devConsole =
  (fn: 'log' | 'error' | 'warn' | 'info') =>
  (...args: any[]) => {
    if (dev()) {
      // eslint-disable-next-line no-console
      console[fn](...args);
    }
  };

export const clog = devConsole('log');
export const cerror = devConsole('error');
