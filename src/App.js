// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// No need for direct firebase import here as it will be imported via AuthContext
import AnalyticsManager from './components/AnalyticsManager';
import Header from './components/Header';
import Footer from './components/Footer';
import FeedbackButton from './components/FeedbackButton';
import CookieBanner from './components/CookieBanner';
import Modal from './components/Modal';
import WelcomeGuide from './components/WelcomeGuide';

// Services
import { initializeAnalytics, trackEvent, trackPageView, identifyUser } from './services/analytics';
import { loadEstimates } from './utils/storage';
import { hasPremiumAccess, hasFeatureAccess, getRemainingFreeEstimates } from './utils/premiumAccess';

// Views
import HomeView from './views/HomeView';
import EstimatorView from './views/EstimatorView';
import ResultView from './views/ResultView';
import SavedEstimatesView from './views/SavedEstimatesView';
import TermsView from './views/TermsView';
import PrivacyView from './views/PrivacyView';
import DashboardView from './views/DashboardView';
import AccountView from './views/AccountView';
import SubscriptionView from './views/SubscriptionView';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ResetPassword from './components/auth/ResetPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';

function AppContent() {
  const [view, setView] = useState('home');
  const [industry, setIndustry] = useState('');
  const [projectType, setProjectType] = useState('');
  const [complexity, setComplexity] = useState('medium');
  const [features, setFeatures] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [email, setEmail] = useState('');
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [savedEstimates, setSavedEstimates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get auth context
  const { currentUser, userDetails } = useAuth();
  
  // Text estimate summary ref for copying
  const textSummaryRef = useRef(null);

  // Initialize analytics and load saved estimates
  useEffect(() => {
    // Initialize analytics
    initializeAnalytics().then(success => {
      if (success) {
        console.log('Analytics initialized successfully');
      }
    });
    
    // Set page title and description for SEO
    document.title = "BidRight.app - Calculate Your Freelance Project Estimates";
    
    // Add meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = "Stop undercharging for your freelance work. Get accurate project estimates based on real industry data to price your services confidently.";
    
    // Add Open Graph tags for better social sharing
    const ogTags = [
      { property: "og:title", content: "BidRight.app - Professional Freelance Estimation Tool" },
      { property: "og:description", content: "Generate data-backed freelance estimates that maximize your profits" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: window.location.href },
    ];
    
    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = tag.content;
    });
    
    // Add favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90' x='50%' text-anchor='middle'>💰</text></svg>";
    
    // Load saved estimates
    const storedEstimates = loadEstimates();
    if (storedEstimates && storedEstimates.length > 0) {
      setSavedEstimates(storedEstimates);
    }
    
    // Check for redirect after login
    const redirectView = localStorage.getItem('redirectAfterLogin');
    if (redirectView && currentUser) {
      setView(redirectView);
      localStorage.removeItem('redirectAfterLogin');
    }
  }, [currentUser]);

  // Track authenticated user
  useEffect(() => {
    if (currentUser) {
      // Identify user for analytics
      identifyUser(currentUser.uid, {
        user_id: currentUser.uid,
        email: currentUser.email,
        display_name: currentUser.displayName,
        premium_user: hasPremiumAccess(userDetails)
      });
    }
  }, [currentUser, userDetails]);

  // Track page view when view changes
  useEffect(() => {
    trackPageView(view);
  }, [view]);

  // Handle account-related button clicks
  const handleAccountAction = (action) => {
    if (action === 'Login') {
      setView('login');
      trackEvent('click_login');
    } else if (action === 'Sign Up') {
      setView('signup');
      trackEvent('click_signup');
    } else if (action === 'Premium upgrade') {
      if (currentUser) {
        setView('subscription');
        trackEvent('click_premium_upgrade');
      } else {
        localStorage.setItem('redirectAfterLogin', 'subscription');
        setView('login');
        trackEvent('click_premium_upgrade_redirect_login');
      }
    } else {
      setModalContent({
        title: 'Coming Soon',
        message: `${action} functionality will be available soon! Enter your email to be notified when this feature launches.`
      });
      setShowModal(true);
      trackEvent('click_coming_soon_feature', { feature: action });
    }
  };
  
  // Handle email subscription
  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Track the subscription event
    trackEvent('email_subscription', { 
      email_provided: !!email,
      source: view === 'result' ? 'estimate_result' : 'modal'
    });
    
    // Simulate API call to email service
    setTimeout(() => {
      console.log("Email subscription:", email);
      setEmailSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };
  
  // Check if user can save more estimates (for free tier)
  const canSaveMoreEstimates = () => {
    if (hasPremiumAccess(userDetails)) {
      return true; // Premium users can save unlimited estimates
    }
    
    return getRemainingFreeEstimates(userDetails, savedEstimates.length) > 0;
  };
  
  // Enhanced trackEvent function to include user context
  const trackUserEvent = (eventName, eventParams = {}) => {
    // Add user context to event
    const enhancedParams = {
      ...eventParams,
      is_logged_in: !!currentUser,
      has_premium: hasPremiumAccess(userDetails),
      view: view
    };
    
    // Track the event
    trackEvent(eventName, enhancedParams);
  };
  
  // Determine which view to render based on auth status
  const renderView = () => {
    // Views that don't need protection
    if (view === 'home') {
      return <HomeView 
        setView={setView} 
        setMobileMenuOpen={setMobileMenuOpen} 
        savedEstimates={savedEstimates} 
        trackEvent={trackUserEvent}
        isPremium={hasPremiumAccess(userDetails)}
      />;
    }
    
    if (view === 'terms') {
      return <TermsView setView={setView} setMobileMenuOpen={setMobileMenuOpen} />;
    }
    
    if (view === 'privacy') {
      return <PrivacyView setView={setView} setMobileMenuOpen={setMobileMenuOpen} />;
    }
    
    if (view === 'login') {
      return <Login setView={setView} trackEvent={trackUserEvent} />;
    }
    
    if (view === 'signup') {
      return <Signup setView={setView} trackEvent={trackUserEvent} />;
    }
    
    if (view === 'resetPassword') {
      return <ResetPassword setView={setView} trackEvent={trackUserEvent} />;
    }
    
    // Views that need to be protected behind authentication
    if (view === 'dashboard' || view === 'account' || view === 'subscription') {
      const componentMap = {
        'dashboard': DashboardView,
        'account': AccountView,
        'subscription': SubscriptionView
      };
      
      const Component = componentMap[view];
      
      return (
        <ProtectedRoute
          setView={setView}
          currentView={view}
          component={Component}
          componentProps={{
            setView,
            trackEvent: trackUserEvent,
            savedEstimates,
            setSavedEstimates
          }}
        />
      );
    }
    
    if (view === 'saved') {
      return (
        <ProtectedRoute
          setView={setView}
          currentView={view}
          component={SavedEstimatesView}
          componentProps={{
            savedEstimates,
            setSavedEstimates,
            setView,
            setMobileMenuOpen,
            trackEvent: trackUserEvent
          }}
        />
      );
    }
    
    // Default views - these can be used by both logged in and anonymous users
    if (view === 'estimator') {
      return (
        <EstimatorView 
          industry={industry}
          setIndustry={setIndustry}
          projectType={projectType}
          setProjectType={setProjectType}
          complexity={complexity}
          setComplexity={setComplexity}
          features={features}
          setFeatures={setFeatures}
          setEstimate={setEstimate}
          setView={setView}
          setShowPremiumPrompt={setShowPremiumPrompt}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
          trackEvent={trackUserEvent}
          userDetails={userDetails}
          canSaveMoreEstimates={canSaveMoreEstimates()}
        />
      );
    }
    
    if (view === 'result') {
      return (
        <ResultView 
          estimate={estimate}
          industry={industry}
          projectType={projectType}
          complexity={complexity}
          features={features}
          showPremiumPrompt={showPremiumPrompt && !hasPremiumAccess(userDetails)}
          setView={setView}
          email={email}
          setEmail={setEmail}
          emailSubmitted={emailSubmitted}
          handleSubscribe={handleSubscribe}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          textSummaryRef={textSummaryRef}
          savedEstimates={savedEstimates}
          setSavedEstimates={setSavedEstimates}
          setModalContent={setModalContent}
          setShowModal={setShowModal}
          trackEvent={trackUserEvent}
          handleAccountAction={handleAccountAction}
          setMobileMenuOpen={setMobileMenuOpen}
          isLoggedIn={!!currentUser}
          isPremium={hasPremiumAccess(userDetails)}
          canSaveMoreEstimates={canSaveMoreEstimates()}
          hasRiskAssessment={hasFeatureAccess(userDetails, 'risk_assessment')}
          hasProjectBreakdown={hasFeatureAccess(userDetails, 'project_breakdown')}
          hasCompetitorRates={hasFeatureAccess(userDetails, 'competitor_rates')}
        />
      );
    }
    
    // Default to home if view not found
    return <HomeView 
      setView={setView} 
      setMobileMenuOpen={setMobileMenuOpen} 
      savedEstimates={savedEstimates} 
      trackEvent={trackUserEvent}
      isPremium={hasPremiumAccess(userDetails)}
    />;
  };
  
  return (
    <div className="min-h-screen bg-gray-50" role="application" aria-label="BidRight freelance estimation application">
      <Header 
        view={view} 
        setView={setView} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        savedEstimates={savedEstimates}
        handleAccountAction={handleAccountAction}
        trackEvent={trackUserEvent}
        isLoggedIn={!!currentUser}
        userName={currentUser?.displayName}
        isPremium={hasPremiumAccess(userDetails)}
      />
      
      <main className="py-8" role="main">
        {renderView()}
      </main>
      
      <Footer setView={setView} setMobileMenuOpen={setMobileMenuOpen} />
      
      <FeedbackButton trackEvent={trackUserEvent} />
      
      <div className="fixed top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 transform rotate-0 origin-top-right z-50" title="We're still improving - share your feedback!">
        BETA
      </div>
      
      <Modal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        modalContent={modalContent}
        email={email}
        setEmail={setEmail}
        handleSubscribe={handleSubscribe}
      />
      
      <CookieBanner setView={setView} trackEvent={trackUserEvent} />
      
      <WelcomeGuide view={view} trackEvent={trackUserEvent} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;