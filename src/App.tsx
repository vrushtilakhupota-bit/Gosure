import { useState, useCallback, useLayoutEffect, useRef } from 'react';
import { NavContext, ScreenName } from './context/NavContext';

import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import CreateAccountScreen from './screens/CreateAccountScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import DestinationSafetyScreen from './screens/DestinationSafetyScreen';
import MapScreen from './screens/MapScreen';
import SafeRouteScreen from './screens/SafeRouteScreen';
import ActiveJourneyScreen from './screens/ActiveJourneyScreen';
import LiveLocationScreen from './screens/LiveLocationScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import SafetyTipsScreen from './screens/SafetyTipsScreen';
import JourneyScreen from './screens/JourneyScreen';
import ProfileScreen from './screens/ProfileScreen';
import SafetyTimerScreen from './screens/SafetyTimerScreen';
import ScamAlertsScreen from './screens/ScamAlertsScreen';
import AssistantScreen from './screens/AssistantScreen';
import PhraseHelperScreen from './screens/PhraseHelperScreen';
import BatteryAlertScreen from './screens/BatteryAlertScreen';
import SafePlaceFinderScreen from './screens/SafePlaceFinderScreen';
import SafetyOverlays from './components/SafetyOverlays';
import SettingsScreen from './screens/SettingsScreen';

type HistoryEntry = { screen: ScreenName; params: Record<string, any> };

function renderScreen(screen: ScreenName) {
  switch (screen) {
    case 'splash': return <SplashScreen />;
    case 'onboarding': return <OnboardingScreen />;
    case 'login': return <LoginScreen />;
    case 'otp': return <OtpScreen />;
    case 'create-account': return <CreateAccountScreen />;
    case 'forgot-password': return <ForgotPasswordScreen />;
    case 'home': return <HomeScreen />;
    case 'explore': return <ExploreScreen />;
    case 'destination-safety': return <DestinationSafetyScreen />;
    case 'map': return <MapScreen />;
    case 'safe-route': return <SafeRouteScreen />;
    case 'active-journey': return <ActiveJourneyScreen />;
    case 'live-location': return <LiveLocationScreen />;
    case 'emergency': return <EmergencyScreen />;
    case 'nearby-help': return <SafePlaceFinderScreen />;
    case 'safety-tips': return <SafetyTipsScreen />;
    case 'journey': return <JourneyScreen />;
    case 'profile': return <ProfileScreen />;
    case 'safety-timer': return <SafetyTimerScreen />;
    case 'scam-alerts': return <ScamAlertsScreen />;
    case 'assistant': return <AssistantScreen />;
    case 'phrases': return <PhraseHelperScreen />;
    case 'battery': return <BatteryAlertScreen />;
    case 'settings': return <SettingsScreen />;
    default: return <HomeScreen />;
  }
}

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [params, setParams] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const [stripBg, setStripBg] = useState({ color: '#F2F2F7', image: 'none' });

  // Colour the status-bar strip like the top of the current screen so the header looks full-bleed.
  useLayoutEffect(() => {
    const screenEl = rootRef.current?.firstElementChild as HTMLElement | null;
    if (!screenEl) return;
    const pick = (el: Element | null) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const transparent = cs.backgroundColor === 'rgba(0, 0, 0, 0)' || cs.backgroundColor === 'transparent';
      return transparent && cs.backgroundImage === 'none' ? null : { color: cs.backgroundColor, image: cs.backgroundImage };
    };
    setStripBg(pick(screenEl.firstElementChild) || pick(screenEl) || { color: '#F2F2F7', image: 'none' });
  }, [screen]);

  const navigate = useCallback((newScreen: ScreenName, newParams: Record<string, any> = {}) => {
    setHistory(h => [...h, { screen, params }]);
    setScreen(newScreen);
    setParams(newParams);
  }, [screen, params]);

  const goBack = useCallback(() => {
    setHistory(h => {
      const prev = h[h.length - 1];
      if (prev) {
        setScreen(prev.screen);
        setParams(prev.params);
        return h.slice(0, -1);
      }
      return h;
    });
  }, []);

  return (
    <NavContext.Provider value={{ screen, params, navigate, goBack }}>
      <div className="relative w-full overflow-hidden flex flex-col" style={{ height: '100svh', backgroundColor: stripBg.color, backgroundImage: stripBg.image }}>
        <div className="shrink-0" style={{ height: 'var(--safe-top)' }} />
        <div ref={rootRef} className="relative flex-1 min-h-0">
          {renderScreen(screen)}
          <SafetyOverlays />
        </div>
      </div>
    </NavContext.Provider>
  );
}
