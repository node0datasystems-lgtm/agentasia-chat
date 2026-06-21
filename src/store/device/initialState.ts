import type { DeviceListItem } from '@agentasia/types';

export interface DeviceState {
  devices: DeviceListItem[];
  isDevicesInit: boolean;
}

export const initialState: DeviceState = {
  devices: [],
  isDevicesInit: false,
};
