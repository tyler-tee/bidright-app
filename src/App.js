// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AnalyticsManager from './components/AnalyticsManager';
import Header from './components/Header';
import Footer from './components/Footer';
import FeedbackButton from './components/FeedbackButton';
import CookieBanner from './components/CookieBanner';
import Modal from './components/Modal';
import WelcomeGuide from './components/WelcomeGuide';

// Views
import HomeView from './views/HomeView';
import EstimatorView from './views/EstimatorView';
import ResultView from './views/ResultView';
import SavedEstimatesView from './views/SavedEstimatesView';
import TermsView from './views/TermsView';
import PrivacyView from './views/PrivacyView';
import DashboardView from './views/DashboardView';

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

  // Track events for analytics
  const trackEvent = (eventName, eventParams = {}) => {
    // Analytics event tracking
    console.log(`Event tracked: ${eventName}`, eventParams);
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  // Setup SEO and load saved estimates
  useEffect(() => {
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
    const storedEstimates = localStorage.getItem('freelanceEstimates');
    if (storedEstimates) {
      try {
        setSavedEstimates(JSON.parse(storedEstimates));
      } catch (error) {
        console.error("Error loading saved estimates:", error);
      }
    }
    
    // Check for redirect after login
    const redirectView = localStorage.getItem('redirectAfterLogin');
    if (redirectView && currentUser) {
      setView(redirectView);
      localStorage.removeItem('redirectAfterLogin');
    }
  }, [currentUser]);

  // Handle account-related button clicks
  const handleAccountAction = (action) => {
    if (action === 'Login') {
      setView('login');
    } else if (action === 'Sign Up') {
      setView('signup');
    } else if (action === 'Premium upgrade') {
      if (currentUser) {
        setView('subscription');
      } else {
        localStorage.setItem('redirectAfterLogin', 'subscription');
        setView('login');
      }
    } else {
      setModalContent({
        title: 'Coming Soon',
        message: `${action} functionality will be available soon! Enter your email to be notified when this feature launches.`
      });
      setShowModal(true);
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
    
    // Simulate API call to email service
    setTimeout(() => {
      // In a real app, this would send the email to your backend or email service
      console.log("Email subscription:", email);
      
      // Track the subscription event
      trackEvent('email_subscription', { 
        source: view === 'result' ? 'estimate_result' : 'modal'
      });
      
      setEmailSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };
  
  // Determine which view to render based on auth status
  const renderView = () => {
    // Views that don't need protection
    if (view === 'home') {
      return <HomeView setView={setView} setMobileMenuOpen={setMobileMenuOpen} savedEstimates={savedEstimates} trackEvent={trackEvent} />;
    }
    
    if (view === 'terms') {
      return <TermsView setView={setView} setMobileMenuOpen={setMobileMenuOpen} />;
    }
    
    if (view === 'privacy') {
      return <PrivacyView setView={setView} setMobileMenuOpen={setMobileMenuOpen} />;
    }
    
    if (view === 'login') {
      return <Login setView={setView} trackEvent={trackEvent} />;
    }
    
    if (view === 'signup') {
      return <Signup setView={setView} trackEvent={trackEvent} />;
    }
    
    if (view === 'resetPassword') {
      return <ResetPassword setView={setView} trackEvent={trackEvent} />;
    }
    
    // Views that need conditional protection
    if (view === 'dashboard') {
      return (
        <ProtectedRoute
          setView={setView}
          currentView={view}
          component={DashboardView}
          componentProps={{
            setView,
            trackEvent,
            savedEstimates,
          }}
        />
      );
    }
    
    if (view === 'saved') {
      // Protected route if user is logged in, otherwise show login
      return currentUser ? (
        <SavedEstimatesView 
          savedEstimates={savedEstimates} 
          setSavedEstimates={setSavedEstimates} 
          setView={setView}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      ) : (
        <ProtectedRoute
          setView={setView}
          currentView={view}
          component={SavedEstimatesView}
          componentProps={{
            savedEstimates,
            setSavedEstimates,
            setView,
            setMobileMenuOpen
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
          trackEvent={trackEvent}
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
          showPremiumPrompt={showPremiumPrompt && !userDetails?.isSubscribed}
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
          trackEvent={trackEvent}
          handleAccountAction={handleAccountAction}
          setMobileMenuOpen={setMobileMenuOpen}
          isLoggedIn={!!currentUser}
          isPremium={userDetails?.isSubscribed}
        />
      );
    }
    
    // Default to home if view not found
    return <HomeView setView={setView} setMobileMenuOpen={setMobileMenuOpen} savedEstimates={savedEstimates} trackEvent={trackEvent} />;
  };
  
  return (
    <AnalyticsManager>
      <div className="min-h-screen bg-gray-50" role="application" aria-label="BidRight freelance estimation application">
        <Header 
          view={view} 
          setView={setView} 
          mobileMenuOpen={mobileMenuOpen} 
          setMobileMenuOpen={setMobileMenuOpen} 
          savedEstimates={savedEstimates}
          handleAccountAction={handleAccountAction}
          trackEvent={trackEvent}
          isLoggedIn={!!currentUser}
          userName={currentUser?.displayName}
        />
        
        <main className="py-8" role="main">
          {renderView()}
        </main>
        
        <Footer setView={setView} setMobileMenuOpen={setMobileMenuOpen} />
        
        <FeedbackButton trackEvent={trackEvent} />
        
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
        
        <CookieBanner setView={setView} trackEvent={trackEvent} />
        
        <WelcomeGuide view={view} trackEvent={trackEvent} />
      </div>
    </AnalyticsManager>
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