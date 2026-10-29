import { useState } from "react";

export default function useEnSyncedState<T>(
  externalValue: T,
  syncKey: unknown = externalValue,
) {
  const [state, setState] = useState(externalValue);
  const [previousKey, setPreviousKey] = useState(syncKey);

  if (!Object.is(previousKey, syncKey)) {
    setPreviousKey(syncKey);
    setState(externalValue);
  }

  return [state, setState] as const;
}
