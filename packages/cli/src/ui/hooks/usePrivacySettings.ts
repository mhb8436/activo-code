/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import {
  Config,
} from '@tcsenpai/ollama-code';

export interface PrivacyState {
  isLoading: boolean;
  error?: string;
  isFreeTier?: boolean;
  dataCollectionOptIn?: boolean;
}

export const usePrivacySettings = (config: Config) => {
  const [privacyState] = useState<PrivacyState>({
    isLoading: false,
    // For Ollama/OpenAI, there's no tier system
    isFreeTier: undefined,
    dataCollectionOptIn: undefined,
  });

  const updateDataCollectionOptIn = useCallback(
    async (optIn: boolean) => {
      // No-op for Ollama/OpenAI - no remote data collection settings
      return;
    },
    [config],
  );

  return {
    privacyState,
    updateDataCollectionOptIn,
  };
};
