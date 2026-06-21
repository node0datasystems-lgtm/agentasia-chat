/**
 * Application settings storage related constants
 */
import { DEFAULT_ELECTRON_DESKTOP_SHORTCUTS } from '@agentasia/const/desktopGlobalShortcuts';
import type { NetworkProxySettings } from '@agentasia/electron-client-ipc';

import { appStorageDir } from '@/const/dir';
import { UPDATE_CHANNEL } from '@/modules/updater/configs';
import type { ElectronMainStore } from '@/types/store';

/**
 * Storage name
 */
export const STORE_NAME = 'agentasia-settings';

export const defaultProxySettings: NetworkProxySettings = {
  enableProxy: false,
  proxyBypass: 'localhost, 127.0.0.1, ::1',
  proxyPort: '',
  proxyRequireAuth: false,
  proxyServer: '',
  proxyType: 'http',
};

/**
 * Storage default values
 */
export const STORE_DEFAULTS: ElectronMainStore = {
  appTrayVisible: true,
  dataSyncConfig: { storageMode: 'cloud' },
  encryptedTokens: {},
  gatewayDeviceDescription: '',
  gatewayDeviceId: '',
  gatewayDeviceName: '',
  gatewayEnabled: true,
  gatewayUrl: 'https://device-gateway.agentasia.ai',
  heteroTracingEnabled: false,
  imessageBridgeConfigs: [],
  locale: 'auto',
  localFileWorkspaceRoots: [],
  networkProxy: defaultProxySettings,
  pendingRestoreRoute: '',
  shortcuts: DEFAULT_ELECTRON_DESKTOP_SHORTCUTS,
  storagePath: appStorageDir,
  themeMode: 'system',
  updateChannel: UPDATE_CHANNEL,
};
