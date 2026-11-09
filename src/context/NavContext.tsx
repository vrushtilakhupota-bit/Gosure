import { createContext, useContext } from 'react';

export type ScreenName =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'otp'
  | 'create-account'
  | 'forgot-password'
  | 'home'
  | 'explore'
  | 'destination-safety'
  | 'map'
  | 'safe-route'
  | 'active-journey'
  | 'live-location'
  | 'emergency'
  | 'nearby-help'
  | 'safety-tips'
  | 'journey'
  | 'profile'
  | 'safety-timer'
  | 'scam-alerts'
  | 'assistant'
  | 'phrases'
  | 'battery'
  | 'settings';

interface NavContextType {
  screen: ScreenName;
  params: Record<string, any>;
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  goBack: () => void;
}

export const NavContext = createContext<NavContextType>({
  screen: 'splash',
  params: {},
  navigate: () => {},
  goBack: () => {},
});

export const useNav = () => useContext(NavContext);
