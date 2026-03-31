import * as React from "react";

type SetStateAction<T> = T | ((previousState: T) => T);

type Options<T> = {
  deserialize?: (value: string) => T;
  serialize?: (value: T) => string;
};

export function usePersistentState<T>(key: string, initialValue: T, options: Options<T> = {}) {
  const { deserialize = JSON.parse as (value: string) => T, serialize = JSON.stringify } = options;

  const [state, setState] = React.useState(initialValue);

  React.useEffect(() => {
    try {
      const value = window.localStorage.getItem(key);
      if (!value) return;
      setState(deserialize(value));
    } catch {
      // Ignore malformed or unavailable storage and keep the default value.
    }
  }, [deserialize, key]);

  const updateState = React.useCallback(
    (value: SetStateAction<T>) => {
      setState((previousState) => {
        const nextState = typeof value === "function" ? (value as (value: T) => T)(previousState) : value;

        try {
          window.localStorage.setItem(key, serialize(nextState));
        } catch {
          // Ignore write failures and keep the in-memory value.
        }

        return nextState;
      });
    },
    [key, serialize],
  );

  return [state, updateState] as const;
}
