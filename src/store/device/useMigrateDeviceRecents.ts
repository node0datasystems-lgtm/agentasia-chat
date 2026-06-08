import { isDesktop } from '@lobechat/const';
import { useEffect } from 'react';

import { useElectronStore } from '@/store/electron';

import { useDeviceStore } from './store';

// Module-level guard: the migration is global, not per-component, so only the
// first mounted caller runs it per session (localStorage clearing makes it a
// no-op across reloads anyway).
let migrationStarted = false;

/**
 * Runs the one-time localStorage → `device.workingDirs` migration once the
 * device store is populated and this machine's deviceId is known (desktop only).
 */
export const useMigrateDeviceRecents = (): void => {
  const currentDeviceId = useElectronStore((s) => s.gatewayDeviceInfo?.deviceId);
  const isDevicesInit = useDeviceStore((s) => s.isDevicesInit);
  const migrate = useDeviceStore((s) => s.migrateLocalRecentsToDevice);

  useEffect(() => {
    if (migrationStarted || !isDesktop || !currentDeviceId || !isDevicesInit) return;
    migrationStarted = true;
    void migrate(currentDeviceId);
  }, [currentDeviceId, isDevicesInit, migrate]);
};
