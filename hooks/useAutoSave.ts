import { useCallback, useEffect, useRef, useState } from "react";

import { useFocusEffect } from "@react-navigation/native";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  debounceMs?: number;
  saveOnBlur?: boolean;
  saveOnUnmount?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  saveOnBlur = true,
  saveOnUnmount = true,
}: UseAutoSaveOptions<T>) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<T>(data);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFocusedRef = useRef(true);
  const isSavingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);

  // Track focus state
  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      return () => {
        isFocusedRef.current = false;
        if (
          saveOnBlur &&
          hasUnsavedChangesRef.current &&
          !isSavingRef.current
        ) {
          // Save immediately when losing focus
          performSave();
        }
      };
    }, [performSave, saveOnBlur])
  );

  const performSave = useCallback(async () => {
    if (isSavingRef.current || !hasUnsavedChangesRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    try {
      await onSave(data);
      setLastSavedData(data);
      hasUnsavedChangesRef.current = false;
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, [data, onSave]);

  // Debounced save
  const scheduleSave = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (isFocusedRef.current) {
        performSave();
      }
    }, debounceMs);
  }, [performSave, debounceMs]);

  // Check if data has changed
  useEffect(() => {
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData);
    hasUnsavedChangesRef.current = hasChanged;
    setHasUnsavedChanges(hasChanged);

    if (hasChanged && isFocusedRef.current) {
      scheduleSave();
    }
  }, [data, lastSavedData]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (
        saveOnUnmount &&
        hasUnsavedChangesRef.current &&
        !isSavingRef.current
      ) {
        performSave();
      }
    };
  }, [saveOnUnmount, performSave]);

  return {
    hasUnsavedChanges,
    isSaving,
    saveNow: performSave,
  };
}
