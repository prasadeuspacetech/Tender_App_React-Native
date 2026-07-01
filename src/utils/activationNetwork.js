import * as Network from 'expo-network';

/** Used only by the Activation screen before calling Firebase. */
export const isActivationNetworkAvailable = async () => {
  try {
    const state = await Network.getNetworkStateAsync();
    if (!state.isConnected) return false;
    if (state.isInternetReachable === false) return false;
    return true;
  } catch {
    return false;
  }
};
