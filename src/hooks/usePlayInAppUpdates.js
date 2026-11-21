import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { GetData, StoreData } from '../constants/storage';

const SNOOZE_KEY = 'play_update_snooze_until';
const SNOOZE_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

/**
 * Play compares version codes, not the marketing version string.
 */
function compareVersionCodes(store, installed) {
  const storeCode = Number.parseInt(store, 10);
  const installedCode = Number.parseInt(installed, 10);
  if (!Number.isFinite(storeCode) || !Number.isFinite(installedCode)) return 0;
  if (storeCode > installedCode) return 1;
  if (storeCode < installedCode) return -1;
  return 0;
}

function loadUpdateModule() {
  try {
    return require('sp-react-native-in-app-updates');
  } catch (error) {
    if (__DEV__) {
      console.warn('[PlayInAppUpdates] native module unavailable', error);
    }
    return null;
  }
}

async function isSnoozed() {
  const until = await GetData(SNOOZE_KEY);
  if (until == null) return false;
  return Date.now() < Number(until);
}

async function snoozeForFiveDays() {
  await StoreData(SNOOZE_KEY, Date.now() + SNOOZE_MS);
}

/**
 * Soft Play in-app update: flexible only (never blocks the app).
 * If the user dismisses the Play sheet, we wait 5 days before asking again.
 */
export function usePlayInAppUpdates() {
  const checkingRef = useRef(false);
  const flowActiveRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      return;
    }

    const mod = loadUpdateModule();
    if (!mod) return;

    const updates = new mod.default(__DEV__);
    const { IAUInstallStatus, IAUUpdateKind } = mod;

    const onStatus = (event) => {
      const status = Number(event.status);
      if (status === IAUInstallStatus.DOWNLOADED) {
        updates.installUpdate();
        return;
      }
      if (
        status === IAUInstallStatus.FAILED ||
        status === IAUInstallStatus.CANCELED
      ) {
        flowActiveRef.current = false;
        void snoozeForFiveDays();
      }
    };

    const onIntent = (result) => {
      if (Number(result) === IAUInstallStatus.CANCELED) {
        flowActiveRef.current = false;
        void snoozeForFiveDays();
      }
    };

    updates.addStatusUpdateListener(onStatus);
    updates.addIntentSelectionListener(onIntent);

    const check = async () => {
      if (checkingRef.current || flowActiveRef.current) return;
      if (AppState.currentState !== 'active') return;
      if (await isSnoozed()) return;

      const installed = Application.nativeBuildVersion;
      if (!installed) return;

      checkingRef.current = true;
      try {
        const result = await updates.checkNeedsUpdate({
          curVersion: installed,
          customVersionComparator: compareVersionCodes,
        });

        if (!result.shouldUpdate) return;

        // Soft only — never start an immediate/blocking update.
        if (!result.other?.isFlexibleUpdateAllowed) return;

        flowActiveRef.current = true;
        await updates.startUpdate({ updateType: IAUUpdateKind.FLEXIBLE });
      } catch (error) {
        flowActiveRef.current = false;
        if (__DEV__) {
          console.warn('[PlayInAppUpdates] check failed', error);
        }
      } finally {
        checkingRef.current = false;
      }
    };

    void check();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void check();
    });

    return () => {
      sub.remove();
      updates.removeStatusUpdateListener(onStatus);
      updates.removeIntentSelectionListener(onIntent);
    };
  }, []);
}
