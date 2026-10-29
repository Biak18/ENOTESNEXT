import { useCallback, useRef, useState } from "react";
import type { Action } from "../types";
import type { ScreenHandle } from "../features/screen-contract";

const toolbarActions: Action[] = ["search", "insert", "delete", "save", "print", "excel"];

export function useActionDispatcher() {
  const handles = useRef<Record<string, ScreenHandle | null>>({});
  const [supportedByTab, setSupportedByTab] = useState<Record<string, Action[]>>({});

  const registerHandle = useCallback((tabId: string, handle: ScreenHandle | null) => {
    if (handle) handles.current[tabId] = handle;
    else delete handles.current[tabId];

    const available = toolbarActions.filter((action) => Boolean(handle?.[action]));
    setSupportedByTab((current) => {
      const previous = current[tabId] ?? [];
      if (previous.length === available.length && previous.every((item, index) => item === available[index])) return current;
      const next = { ...current };
      if (available.length) next[tabId] = available;
      else delete next[tabId];
      return next;
    });
  }, []);

  const dispatch = useCallback((tabId: string, action: Action) => {
    const handler = handles.current[tabId]?.[action];
    if (handler) void handler();
  }, []);

  const canClose = useCallback((tabId: string) => {
    return handles.current[tabId]?.canClose?.() ?? true;
  }, []);

  const unregister = useCallback((tabId: string) => {
    delete handles.current[tabId];
    setSupportedByTab((current) => {
      if (!current[tabId]) return current;
      const next = { ...current };
      delete next[tabId];
      return next;
    });
  }, []);

  return { supportedByTab, registerHandle, dispatch, canClose, unregister };
}
