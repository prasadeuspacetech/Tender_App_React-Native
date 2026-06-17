import { CommonActions, createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

/** Reset root stack to Activation (post-expiry / logout). */
export const resetToActivation = () => {
  if (!navigationRef.isReady()) return;

  navigationRef.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Activation' }],
    }),
  );
};
