// src/App.js — VFIT MILANO EDITION
import React, { useState, useEffect } from "react";
import { StateProvider, useStateManager, ACTIONS } from "./stateManager";
import {
  DeviceDetectionProvider,
  useDeviceDetection,
} from "./utils/DeviceDetectionContext";
import PPModal from "./components/PPModal";
import PrivacyPolicy from "./views/PrivacyPolicy";
import MainDisplay from "./components/MainDisplay";
import SplashPage from "./views/SplashPage";
import MobileView from "./views/MobileView";
import Chatbot from "./components/Chatbot";
import GenderSelector from "./views/GenderSelector";
import Auth from "./components/Auth";
import { supabase } from "./supabaseClient";

const VFIT_TOKEN_KEY = "vfit_token";

function AppContent() {
  const { state, dispatch, handlePrivacyAccept, handlePrivacyDecline } =
    useStateManager();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const {
    showPrivacyModal,
    showPrivacyPage,
    privacyAccepted,
    privacyConsentChecked,
    theme,
  } = state.appState;
  const { selectedGender } = state.vtoState;
  const { isMobileLayout, deviceInfo } = useDeviceDetection();

  useEffect(() => {
    const syncAuthState = (session) => {
      const token = session?.access_token;
      if (token) {
        localStorage.setItem(VFIT_TOKEN_KEY, token);
        setIsAuthenticated(true);
      } else {
        const storedToken = localStorage.getItem(VFIT_TOKEN_KEY);
        setIsAuthenticated(!!storedToken);
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        syncAuthState(session);
      } catch {
        setIsAuthenticated(!!localStorage.getItem(VFIT_TOKEN_KEY));
      } finally {
        setAuthChecking(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          localStorage.setItem(VFIT_TOKEN_KEY, session.access_token);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(VFIT_TOKEN_KEY);
          setIsAuthenticated(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (token) => {
    if (token) {
      localStorage.setItem(VFIT_TOKEN_KEY, token);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      localStorage.removeItem(VFIT_TOKEN_KEY);
      setIsAuthenticated(false);
    }
  };

  const renderWithLogout = (content) => (
    <>
      <button
        type="button"
        className="vfit-logout-btn"
        onClick={handleLogout}
        aria-label="Log out of your account"
      >
        Log out
      </button>
      {content}
    </>
  );

  // Vfit Milano Theme Persistence
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
    try {
      // Updated key to reflect new Vfit branding
      localStorage.setItem("vfit_theme", theme);
    } catch {
      // Storage unavailable
    }
  }, [theme]);

  // Handle Splash Logic with Vfit branding
  useEffect(() => {
    const splashShown = sessionStorage.getItem("vfit_splash_shown");
    if (splashShown) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashEnter = () => {
    sessionStorage.setItem("vfit_splash_shown", "true");
    setShowSplash(false);
  };

  const handleGoHome = () => {
    sessionStorage.removeItem("vfit_splash_shown");
    setShowSplash(true);
  };

  const handlePrivacyAcceptLocal = () => {
    handlePrivacyAccept();
    dispatch({
      type: ACTIONS.SET_VTO_STATE,
      payload: { selectedGender: null },
    });
  };

  const handleShowFullPolicy = () => {
    dispatch({
      type: ACTIONS.SET_APP_STATE,
      payload: { showPrivacyPage: true, showPrivacyModal: false },
    });
  };

  const handleBackFromPolicy = () => {
    dispatch({
      type: ACTIONS.SET_APP_STATE,
      payload: { showPrivacyPage: false, showPrivacyModal: true },
    });
  };

  const handleFooterPrivacyClick = () => {
    dispatch({
      type: ACTIONS.SET_APP_STATE,
      payload: { showPrivacyPage: true },
    });
  };

  const handleBackFromFooterPolicy = () => {
    dispatch({
      type: ACTIONS.SET_APP_STATE,
      payload: { showPrivacyPage: false },
    });
  };

  const handleInitialGenderSelection = (gender) => {
    dispatch({
      type: ACTIONS.SET_VTO_STATE,
      payload: { selectedGender: gender },
    });
  };

  /** * RENDER LOGIC
   * Using Vfit's minimalist design philosophy
   */

  if (authChecking) {
    return (
      <div
        className="vfit-loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a",
          color: "#f5f5f0",
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
        }}
      >
        Vfit Milano
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  if (showSplash) {
    return renderWithLogout(<SplashPage onEnter={handleSplashEnter} />);
  }

  if (!privacyConsentChecked) {
    return renderWithLogout(
      <div
        className="vfit-loading-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#0a0a0a", // Milano Black
          color: "#f5f5f0", // Milano Beige
          fontFamily: "Inter, sans-serif",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontSize: "0.8rem",
        }}
      >
        Vfit Milano
      </div>
    );
  }

  if (showPrivacyPage) {
    return renderWithLogout(
      <PrivacyPolicy
        onBack={
          showPrivacyModal ? handleBackFromPolicy : handleBackFromFooterPolicy
        }
      />
    );
  }

  if (!privacyAccepted) {
    return renderWithLogout(
      <div className="app-container vfit-milano">
        <PPModal
          isOpen={showPrivacyModal}
          onAccept={handlePrivacyAcceptLocal}
          onClose={handlePrivacyDecline}
          onShowFullPolicy={handleShowFullPolicy}
        />
        <div className="privacy-required-message">
          <p>
            To access the atelier, please review and accept our privacy policy.
          </p>
          <button
            className="btn-privacy-agree"
            onClick={() =>
              dispatch({
                type: ACTIONS.SET_APP_STATE,
                payload: { showPrivacyModal: true },
              })
            }
          >
            Review Policy
          </button>
        </div>
      </div>
    );
  }

  if (!selectedGender) {
    return renderWithLogout(
      <>
        <GenderSelector onSelectGender={handleInitialGenderSelection} />
        <Chatbot />
      </>
    );
  }

  if (isMobileLayout && !deviceInfo.isPortrait) {
    return renderWithLogout(
      <div className="rotate-device-overlay">
        <div className="rotate-device-icon"></div>
        <p>Rotate your device to portrait for the best Vfit experience.</p>
      </div>
    );
  }

  const VfitFooter = () => (
    <footer className="app-footer">
      <p>© 2026 Vfit Milano — TechAngelX for Birkbeck</p>
      <button
        className="footer-privacy-link"
        onClick={handleFooterPrivacyClick}
      >
        Privacy Policy
      </button>
    </footer>
  );

  if (isMobileLayout) {
    return renderWithLogout(
      <div className="app-container vfit-milano">
        <MobileView deviceInfo={deviceInfo} />
        <VfitFooter />
        <Chatbot />
      </div>
    );
  }

  return renderWithLogout(
    <div className="app-container vfit-milano">
      <MainDisplay onGoHome={handleGoHome} />
      <VfitFooter />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <StateProvider>
      <DeviceDetectionProvider>
        <AppContent />
      </DeviceDetectionProvider>
    </StateProvider>
  );
}
