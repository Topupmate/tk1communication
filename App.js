import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, BackHandler } from 'react-native';
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import FcmRegistrationBridge from './src/components/push/FcmRegistrationBridge';

import store from './src/store';
import NativeStacks from './src/utilities/NativeStacks';
import { navigationRef } from './src/utilities/RootNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createScopedDebugger } from './src/utils/debugScopes';
import { usePlayInAppUpdates } from './src/hooks/usePlayInAppUpdates';

const __navDebug = createScopedDebugger('NAV');

const __getActiveRoute = (state) => {
  if (!state) return undefined;
  const route = state.routes?.[state.index ?? 0];
  if (!route) return undefined;
  if (route.state) return __getActiveRoute(route.state);
  return route;
};

if (!BackHandler.removeEventListener) {
  const subscriptions = new Map();
  const originalAddEventListener = BackHandler.addEventListener;

  BackHandler.addEventListener = function (eventName, handler) {
    const subscription = originalAddEventListener.call(
      this,
      eventName,
      handler
    );
    subscriptions.set(handler, subscription);
    return subscription;
  };

  BackHandler.removeEventListener = function (eventName, handler) {
    const subscription = subscriptions.get(handler);
    if (subscription && subscription.remove) {
      subscription.remove();
      subscriptions.delete(handler);
    }
  };
}

export default function App() {
  const lastRouteNameRef = useRef(null);
  usePlayInAppUpdates();

  useEffect(() => {
    // Auto-enable debug scopes in dev builds so logs always show up.
    // You can still override at runtime by setting global.__DEBUG_*__ flags manually.
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // RN has `global`; modern JS has `globalThis`.
      // eslint-disable-next-line no-undef
      const g = typeof globalThis !== 'undefined' ? globalThis : global;
      if (g && g.__DEBUG_NAV__ == null) g.__DEBUG_NAV__ = true;
      if (g && g.__DEBUG_BUY_AIRTIME__ == null) g.__DEBUG_BUY_AIRTIME__ = true;
      if (g && g.__DEBUG_TV__ == null) g.__DEBUG_TV__ = true;
      if (g && g.__DEBUG_API__ == null) g.__DEBUG_API__ = true;
      if (g && g.__DEBUG_PUSH__ == null) g.__DEBUG_PUSH__ = true;
      __navDebug('[NAV] debug scopes enabled by default', {
        __DEBUG_NAV__: g?.__DEBUG_NAV__,
        __DEBUG_BUY_AIRTIME__: g?.__DEBUG_BUY_AIRTIME__,
        __DEBUG_TV__: g?.__DEBUG_TV__,
        __DEBUG_API__: g?.__DEBUG_API__,
        __DEBUG_PUSH__: g?.__DEBUG_PUSH__,
      });
    }
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <AlertNotificationRoot>
          <NavigationContainer
            ref={navigationRef}
            onReady={() => {
              try {
                const currentRoute = navigationRef.current?.getCurrentRoute?.();
                const name = currentRoute?.name;
                lastRouteNameRef.current = name ?? null;
                __navDebug('[NAV] ready', {
                  routeName: name,
                  params: currentRoute?.params,
                });
              } catch (e) {
                __navDebug('[NAV] ready error', { message: e?.message });
              }
            }}
            onStateChange={(state) => {
              try {
                const activeRoute = __getActiveRoute(state);
                const currentRouteName = activeRoute?.name;
                const prevRouteName = lastRouteNameRef.current;
                if (currentRouteName && currentRouteName !== prevRouteName) {
                  __navDebug('[NAV] route change', {
                    from: prevRouteName,
                    to: currentRouteName,
                    params: activeRoute?.params,
                  });
                  lastRouteNameRef.current = currentRouteName;
                } else if (!prevRouteName && currentRouteName) {
                  __navDebug('[NAV] route init', {
                    to: currentRouteName,
                    params: activeRoute?.params,
                  });
                  lastRouteNameRef.current = currentRouteName;
                }
              } catch (e) {
                __navDebug('[NAV] onStateChange error', { message: e?.message });
              }
            }}
          >
            <FcmRegistrationBridge />
            <SafeAreaView style={{ flex: 1, marginTop: -25 }}>
              <NativeStacks />
            </SafeAreaView>
          </NavigationContainer>
        </AlertNotificationRoot>
      </Provider>
    </GestureHandlerRootView>
  );
}
