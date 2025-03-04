import React, { useState, useEffect, useRef } from 'react';

// Component for Analytics (will be included but not functional until you add your analytics script)
const AnalyticsManager = ({ children, trackEvent }) => {
  useEffect(() => {
    // Placeholder for analytics initialization
    console.log("Analytics initialized");
    
    // Track page view
    const trackPageView = (path) => {
      console.log(`Page view tracked: ${path}`);
      // This is where you'd call your actual analytics tracking
      // window.gtag('config', 'YOUR-GA-ID', { page_path: path });
    };
    
    // Initial page view
    trackPageView(window.location.pathname);
    
    // Listen for route changes if you implement routing
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  return children;
};

const App = () => {
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
  
  // Text estimate summary ref for copying
  const textSummaryRef = useRef(null);
  
  // Analytics event tracking
  const trackEvent = (eventName, eventParams = {}) => {
    // Analytics event tracking
    console.log(`Event tracked: ${eventName}`, eventParams);
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };
  
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
  }, []);
  
  // Industry benchmark data
  const industries = [
    { id: 'webdev', name: 'Web Development', icon: '💻' },
    { id: 'design', name: 'Graphic Design', icon: '🎨' },
    { id: 'writing', name: 'Content Writing', icon: '✍️' },
    { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
    { id: 'video', name: 'Video Production', icon: '🎬' },
  ];
  
  const projectTypes = {
    'webdev': [
      { id: 'landing', name: 'Landing Page', baseHours: 10, baseCost: 500 },
      { id: 'website', name: 'Full Website', baseHours: 40, baseCost: 2000 },
      { id: 'ecommerce', name: 'E-commerce Site', baseHours: 80, baseCost: 4000 },
      { id: 'webapp', name: 'Web Application', baseHours: 100, baseCost: 5000 },
    ],
    'design': [
      { id: 'logo', name: 'Logo Design', baseHours: 8, baseCost: 400 },
      { id: 'branding', name: 'Brand Package', baseHours: 20, baseCost: 1000 },
      { id: 'social', name: 'Social Media Graphics', baseHours: 12, baseCost: 600 },
      { id: 'print', name: 'Print Materials', baseHours: 15, baseCost: 750 },
    ],
    'writing': [
      { id: 'article', name: 'Blog Article', baseHours: 4, baseCost: 200 },
      { id: 'whitepaper', name: 'Whitepaper', baseHours: 15, baseCost: 750 },
      { id: 'emailseq', name: 'Email Sequence', baseHours: 8, baseCost: 400 },
      { id: 'seo', name: 'SEO Content', baseHours: 6, baseCost: 300 },
    ],
    'marketing': [
      { id: 'smm', name: 'Social Media Campaign', baseHours: 20, baseCost: 1000 },
      { id: 'ppc', name: 'PPC Campaign', baseHours: 15, baseCost: 750 },
      { id: 'seo', name: 'SEO Optimization', baseHours: 30, baseCost: 1500 },
      { id: 'email', name: 'Email Marketing', baseHours: 12, baseCost: 600 },
    ],
    'video': [
      { id: 'explainer', name: 'Explainer Video', baseHours: 25, baseCost: 1250 },
      { id: 'promo', name: 'Promotional Video', baseHours: 20, baseCost: 1000 },
      { id: 'interview', name: 'Interview Editing', baseHours: 15, baseCost: 750 },
      { id: 'animation', name: 'Animation', baseHours: 40, baseCost: 2000 },
    ],
  };
  
  const featureOptions = {
    'webdev': [
      { id: 'responsive', name: 'Responsive Design', hourMod: 1.2, costMod: 1.2 },
      { id: 'cms', name: 'Content Management System', hourMod: 1.5, costMod: 1.4 },
      { id: 'payment', name: 'Payment Integration', hourMod: 1.3, costMod: 1.3 },
      { id: 'auth', name: 'User Authentication', hourMod: 1.4, costMod: 1.3 },
      { id: 'api', name: 'API Integration', hourMod: 1.3, costMod: 1.2 },
    ],
    'design': [
      { id: 'revisions', name: 'Unlimited Revisions', hourMod: 1.5, costMod: 1.3 },
      { id: 'sources', name: 'Source Files', hourMod: 1.1, costMod: 1.2 },
      { id: 'rush', name: 'Rush Delivery', hourMod: 0.8, costMod: 1.5 },
      { id: 'mockup', name: 'Mockup Presentation', hourMod: 1.2, costMod: 1.2 },
    ],
    'writing': [
      { id: 'research', name: 'In-depth Research', hourMod: 1.5, costMod: 1.3 },
      { id: 'seo', name: 'SEO Optimization', hourMod: 1.3, costMod: 1.2 },
      { id: 'revisions', name: 'Multiple Revisions', hourMod: 1.4, costMod: 1.3 },
      { id: 'interview', name: 'Expert Interviews', hourMod: 1.6, costMod: 1.4 },
    ],
    'marketing': [
      { id: 'analytics', name: 'Analytics Setup', hourMod: 1.2, costMod: 1.2 },
      { id: 'competitor', name: 'Competitor Analysis', hourMod: 1.3, costMod: 1.3 },
      { id: 'persona', name: 'Audience Persona', hourMod: 1.2, costMod: 1.2 },
      { id: 'report', name: 'Performance Reporting', hourMod: 1.3, costMod: 1.1 },
    ],
    'video': [
      { id: 'script', name: 'Script Writing', hourMod: 1.3, costMod: 1.2 },
      { id: 'voiceover', name: 'Professional Voiceover', hourMod: 1.2, costMod: 1.4 },
      { id: 'music', name: 'Licensed Music', hourMod: 1.1, costMod: 1.3 },
      { id: 'captions', name: 'Subtitles/Captions', hourMod: 1.2, costMod: 1.1 },
    ],
  };
  
  const complexityMultipliers = {
    'low': { hourMod: 0.8, costMod: 0.9 },
    'medium': { hourMod: 1, costMod: 1 },
    'high': { hourMod: 1.5, costMod: 1.3 },
    'expert': { hourMod: 2, costMod: 1.8 },
  };
  
  const calculateEstimate = () => {
    try {
      // Validate required fields
      if (!industry || !projectType) {
        console.log("Missing industry or project type");
        return null;
      }
      
      // Validate industry exists
      if (!projectTypes[industry]) {
        console.log("Invalid industry selected");
        return null;
      }
      
      // Find project
      const selectedProject = projectTypes[industry].find(p => p.id === projectType);
      if (!selectedProject) {
        console.log("Invalid project type selected");
        return null;
      }
      
      // Ensure complexity is valid
      const complexityLevel = complexity || 'medium';
      if (!complexityMultipliers[complexityLevel]) {
        console.log("Invalid complexity level");
        return null;
      }
      
      // Start with base values
      let totalHours = selectedProject.baseHours || 10;
      let totalCost = selectedProject.baseCost || 500;
      
      console.log(`Base values - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      // Apply complexity multiplier
      const complexityMod = complexityMultipliers[complexityLevel];
      totalHours *= complexityMod.hourMod;
      totalCost *= complexityMod.costMod;
      
      console.log(`After complexity - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      // Apply feature modifiers if applicable
      if (features && features.length > 0 && featureOptions[industry]) {
        features.forEach(featureId => {
          const feature = featureOptions[industry].find(f => f.id === featureId);
          if (feature) {
            totalHours *= feature.hourMod;
            totalCost *= feature.costMod;
            console.log(`Applied feature ${feature.name}`);
          }
        });
      }
      
      console.log(`After features - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      // Round to reasonable values
      totalHours = Math.round(totalHours);
      totalCost = Math.round(totalCost / 50) * 50; // Round to nearest $50
      
      // Create ranges for more realistic estimates
      const hourRange = {
        min: Math.round(totalHours * 0.8),
        max: Math.round(totalHours * 1.2)
      };
      
      const costRange = {
        min: Math.round((totalCost * 0.9) / 50) * 50,
        max: Math.round((totalCost * 1.1) / 50) * 50
      };
      
      console.log(`Final values - Hours: ${totalHours}, Cost: ${totalCost}`);
      
      return {
        hours: totalHours,
        hourRange,
        cost: totalCost,
        costRange,
        revisionLimit: 2,
        projectBreakdown: false,
        riskAssessment: false,
        competitorRates: false,
        // Add metadata for saved estimates
        created: new Date().toISOString(),
        id: Date.now().toString(),
        industryName: industries.find(i => i.id === industry)?.name,
        projectName: projectTypes[industry].find(p => p.id === projectType)?.name,
        complexityName: complexity.charAt(0).toUpperCase() + complexity.slice(1),
        featuresSelected: features.map(f => featureOptions[industry].find(opt => opt.id === f)?.name).filter(Boolean)
      };
    } catch (error) {
      console.error("Error calculating estimate:", error);
      return null;
    }
  };
  
  const handleCalculateClick = () => {
    try {
      if (!industry || !projectType) {
        setError("Please select both an industry and project type");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Simulate calculation delay for better UX
      setTimeout(() => {
        try {
          const result = calculateEstimate();
          if (result) {
            setEstimate(result);
            setView('result');
            setShowPremiumPrompt(true);
            
            // Track conversion
            if (window.gtag) {
              window.gtag('event', 'estimate_created', {
                'industry': industry,
                'project_type': projectType,
                'complexity': complexity
              });
            }
            
            console.log("Estimate calculated successfully:", result);
          } else {
            setError("There was an error calculating your estimate. Please try again.");
          }
        } catch (error) {
          console.error("Error in calculation:", error);
          setError("Something went wrong with the calculation. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }, 800); // Slight delay to show loading state
    } catch (error) {
      console.error("Error in handleCalculateClick:", error);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };
  
  const handleFeatureToggle = (featureId) => {
    setFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Generate text-based estimate summary
  const generateTextSummary = () => {
    if (!estimate) return '';
    
    const industryName = industries.find(i => i.id === industry)?.name || 'Unknown';
    const projectName = projectTypes[industry]?.find(p => p.id === projectType)?.name || 'Unknown';
    const complexityName = complexity.charAt(0).toUpperCase() + complexity.slice(1);
    
    // Format the features as a list
    const featuresList = features.map(featureId => {
      const feature = featureOptions[industry].find(f => f.id === featureId);
      return feature ? `- ${feature.name}` : '';
    }).filter(Boolean).join('\n');
    
    // Create a professional-looking text summary
    return `
# FREELANCE PROJECT ESTIMATE

## Project Details
Industry: ${industryName}
Project Type: ${projectName}
Complexity: ${complexityName}
Date: ${new Date().toLocaleDateString()}

## Estimate Summary
Time Estimate: ${estimate.hourRange.min}-${estimate.hourRange.max} hours
Cost Estimate: ${formatCurrency(estimate.costRange.min)}-${formatCurrency(estimate.costRange.max)}

${features.length > 0 ? `## Included Features\n${featuresList}` : ''}

---
Generated by BidRight.app | ${window.location.origin}
    `.trim();
  };
  
  // Copy estimate summary to clipboard
  const copyEstimateToClipboard = () => {
    if (!estimate) return;
    
    try {
      const textSummary = generateTextSummary();
      
      // Use the Clipboard API to copy text
      navigator.clipboard.writeText(textSummary)
        .then(() => {
          // Show success modal
          setModalContent({
            title: 'Estimate Copied',
            message: 'Your estimate summary has been copied to your clipboard. You can now paste it into your document or email.'
          });
          setShowModal(true);
        })
        .catch(err => {
          console.error("Error copying to clipboard:", err);
          
          // Fallback method using textarea if clipboard API fails
          if (textSummaryRef.current) {
            textSummaryRef.current.value = textSummary;
            textSummaryRef.current.select();
            document.execCommand('copy');
            
            setModalContent({
              title: 'Estimate Copied',
              message: 'Your estimate summary has been copied to your clipboard. You can now paste it into your document or email.'
            });
            setShowModal(true);
          } else {
            alert("Could not copy the estimate. Please try again.");
          }
        });
    } catch (error) {
      console.error("Error copying estimate:", error);
      alert("There was an error copying your estimate. Please try again.");
    }
  };
  
  // Handle email subscription with tracking
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
      
      // In a real app, you would send this to your backend
      // fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // })
    }, 1000);
  };
  
  // Save current estimate to localStorage with tracking
  const saveEstimate = () => {
    if (!estimate) return;
    
    try {
      setIsLoading(true);
      
      const newSavedEstimates = [...savedEstimates, estimate];
      setSavedEstimates(newSavedEstimates);
      localStorage.setItem('freelanceEstimates', JSON.stringify(newSavedEstimates));
      
      // Track the save event
      trackEvent('estimate_saved', {
        industry: industry,
        project_type: projectType
      });
      
      setModalContent({
        title: 'Estimate Saved',
        message: 'Your estimate has been saved. You can access all your saved estimates from the "My Estimates" section.'
      });
      setShowModal(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Error saving estimate:", error);
      setError("There was an error saving your estimate. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Delete a saved estimate
  const deleteEstimate = (id) => {
    try {
      const updatedEstimates = savedEstimates.filter(est => est.id !== id);
      setSavedEstimates(updatedEstimates);
      localStorage.setItem('freelanceEstimates', JSON.stringify(updatedEstimates));
    } catch (error) {
      console.error("Error deleting estimate:", error);
    }
  };
  
  // Handle account-related button clicks
  const handleAccountAction = (action) => {
    setModalContent({
      title: 'Coming Soon',
      message: `${action} functionality will be available soon! Enter your email to be notified when this feature launches.`
    });
    setShowModal(true);
  };

  // Modal component
  const Modal = () => {
    if (!showModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">{modalContent.title}</h3>
          <p className="mb-6">{modalContent.message}</p>
          
          {modalContent.title === 'Coming Soon' && (
            <div className="mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSubscribe}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors"
              >
                Notify Me
              </button>
            </div>
          )}
          
          <button
            onClick={() => setShowModal(false)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg w-full transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  
  // Render home page with brief explanation and start button
  const renderHome = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">BidRight.app</h2>
      <p className="text-lg mb-8 text-center max-w-2xl">
        Stop undercharging for your freelance work. Get accurate project estimates 
        based on real industry data to price your services confidently and profitably.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-5xl">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-3xl mb-4 text-blue-500">🎯</div>
          <h3 className="text-xl font-semibold mb-2">Accurate Estimates</h3>
          <p>Generate realistic project timelines and costs based on industry benchmarks</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-3xl mb-4 text-blue-500">💰</div>
          <h3 className="text-xl font-semibold mb-2">Increase Profits</h3>
          <p>Stop undercharging for your services with data-backed pricing guidance</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <div className="text-3xl mb-4 text-blue-500">🔄</div>
          <h3 className="text-xl font-semibold mb-2">Save Time</h3>
          <p>Create professional estimates in minutes instead of hours</p>
        </div>
      </div>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <button 
          onClick={() => {
            setView('estimator');
            setMobileMenuOpen(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Create Your First Estimate
        </button>
        
        {savedEstimates.length > 0 && (
          <button 
            onClick={() => {
              setView('saved');
              trackEvent('view_saved_estimates_home');
              setMobileMenuOpen(false);
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            View Saved Estimates ({savedEstimates.length})
          </button>
        )}
      </div>
    </div>
  );
  
  // Render the main estimator form
  const renderEstimator = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Project Estimate</h2>
      
      <div className="space-y-8">
        {/* Industry Selection */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">1. Select Your Industry</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {industries.map(ind => (
              <button
                key={ind.id}
                type="button"
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  industry === ind.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => {
                  setIndustry(ind.id);
                  setProjectType('');
                  setFeatures([]);
                }}
              >
                <span className="text-3xl mb-2">{ind.icon}</span>
                <span className="text-sm text-center">{ind.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Project Type Selection */}
        {industry && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">2. Select Project Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projectTypes[industry].map(project => (
                <button
                  key={project.id}
                  type="button"
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    projectType === project.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setProjectType(project.id)}
                >
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-sm text-gray-500">
                    Base: ~{project.baseHours} hours | {formatCurrency(project.baseCost)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Project Complexity */}
        {projectType && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">3. Project Complexity</h3>
            <div className="flex flex-wrap gap-4">
              {Object.keys(complexityMultipliers).map(level => (
                <button
                  key={level}
                  type="button"
                  className={`py-2 px-6 rounded-lg border-2 transition-all ${
                    complexity === level 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setComplexity(level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional Features */}
        {projectType && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">4. Additional Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featureOptions[industry].map(feature => (
                <label
                  key={feature.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    features.includes(feature.id)
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-5 w-5 text-blue-600"
                    checked={features.includes(feature.id)}
                    onChange={() => handleFeatureToggle(feature.id)}
                  />
                  <span>{feature.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        {projectType && (
          <div className="pt-4">
            <button
              onClick={handleCalculateClick}
              disabled={isLoading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg w-full text-lg transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Calculating...' : 'Calculate Estimate'}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
  // Render the estimate results
  const renderResult = () => {
    if (!estimate) return null;
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Project Estimate</h2>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-blue-600 p-6 text-white">
            <h3 className="text-xl font-bold mb-1">
              {industries.find(i => i.id === industry)?.name} - {projectTypes[industry].find(p => p.id === projectType)?.name}
            </h3>
            <p className="text-blue-100">
              Complexity: {complexity.charAt(0).toUpperCase() + complexity.slice(1)}
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Time Estimate</h4>
                <p className="text-3xl font-bold mb-1">{estimate.hourRange.min}-{estimate.hourRange.max} hours</p>
                <p className="text-sm text-gray-500">Based on project type and selected features</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Cost Estimate</h4>
                <p className="text-3xl font-bold mb-1">{formatCurrency(estimate.costRange.min)}-{formatCurrency(estimate.costRange.max)}</p>
                <p className="text-sm text-gray-500">Recommended price range</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <h4 className="text-lg font-semibold">Included Features</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {features.length > 0 ? (
                  features.map(featureId => (
                    <li key={featureId} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {featureOptions[industry].find(f => f.id === featureId)?.name}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No additional features selected</li>
                )}
              </ul>
            </div>
            
            {/* Premium features teaser */}
            {showPremiumPrompt && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold flex items-center">
                  <span className="text-yellow-500 mr-2">⭐</span>
                  Unlock Premium Features
                </h4>
                <p className="text-sm mb-3">
                  Upgrade to access detailed project breakdowns, risk assessment, 
                  competitor rate analysis, and more!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm mb-3">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">○</span>
                    Detailed Task Breakdown
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">○</span>
                    Risk Assessment
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">○</span>
                    Competitor Rate Analysis
                  </div>
                </div>
                <button 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded font-medium text-sm transition-colors"
                  onClick={() => handleAccountAction('Premium upgrade')}
                >
                  Upgrade for $9.99/month
                </button>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setView('estimator');
                      trackEvent('edit_estimate');
                      setMobileMenuOpen(false);
                    }}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Modify Estimate
                  </button>
                  
                  <div className="flex flex-wrap gap-3">
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                      onClick={() => {
                        copyEstimateToClipboard();
                        trackEvent('copy_estimate');
                      }}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Working...' : 'Copy Estimate'}
                    </button>
                    {/* Hidden textarea for clipboard fallback */}
                    <textarea 
                      ref={textSummaryRef}
                      className="sr-only"
                      aria-hidden="true"
                      tabIndex="-1"
                    />
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      onClick={saveEstimate}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Estimate'}
                    </button>
                  </div>
                </div>
              
              {/* Email capture for lead generation */}
              {showPremiumPrompt && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-2">Save your estimate and get pricing tips</h4>
                  {emailSubmitted ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        Thanks for subscribing! We've sent you an email with your estimate.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email address"
                          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <button 
                          className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-r-lg transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                          onClick={handleSubscribe}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Subscribing...' : 'Subscribe'}
                        </button>
                      </div>
                      {error && (
                        <div className="mt-2 text-red-600 text-sm">
                          {error}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        We'll send you this estimate and occasional pricing tips. No spam ever.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render saved estimates view
  const renderSavedEstimates = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Saved Estimates</h2>
        <button
          onClick={() => {
            setView('estimator');
            setMobileMenuOpen(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Create New Estimate
        </button>
      </div>
      
      {savedEstimates.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">You don't have any saved estimates yet.</p>
          <button
            onClick={() => {
              setView('estimator');
              setMobileMenuOpen(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Create Your First Estimate
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {savedEstimates.map((est) => (
            <div key={est.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="bg-blue-600 p-4 text-white">
                <h3 className="font-semibold">{est.industryName} - {est.projectName}</h3>
                <p className="text-sm text-blue-100">Created: {formatDate(est.created)}</p>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <span className="text-gray-500 text-sm">Time: </span>
                    <span className="font-medium">{est.hourRange.min}-{est.hourRange.max} hours</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Cost: </span>
                    <span className="font-medium">{formatCurrency(est.costRange.min)}-{formatCurrency(est.costRange.max)}</span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500 text-sm">Complexity: </span>
                    <span className="font-medium">{est.complexityName}</span>
                  </div>
                </div>
                
                {est.featuresSelected && est.featuresSelected.length > 0 && (
                  <div className="mb-4">
                    <span className="text-gray-500 text-sm">Features: </span>
                    <span className="font-medium">{est.featuresSelected.join(', ')}</span>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => deleteEstimate(est.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  // Render Terms of Service page
  const renderTerms = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Terms of Service</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="prose max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h3>
          <p>Welcome to BidRight.app. By using our website and services, you agree to these Terms of Service in full. If you disagree with any part of these terms, please do not use our website or services.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">2. Intellectual Property Rights</h3>
          <p>Unless otherwise stated, we own the intellectual property rights for all material on BidRight.app. All intellectual property rights are reserved.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3. Restrictions</h3>
          <p>You are specifically restricted from:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Publishing any material from BidRight.app in any other media without our express permission</li>
            <li>Selling, sublicensing and/or otherwise commercializing any material from BidRight.app</li>
            <li>Using this website in any way that causes, or may cause, damage to the website or impairment of its availability</li>
            <li>Using this website in any way that is unlawful, illegal, fraudulent or harmful</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4. No Warranties</h3>
          <p>This website is provided "as is," with all faults, and we express no representations or warranties of any kind related to this website or the materials contained on this website.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5. Limitation of Liability</h3>
          <p>In no event shall we be held liable for anything arising out of or in any way connected with your use of this website.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6. Indemnification</h3>
          <p>You hereby indemnify us to the fullest extent from and against any and/or all liabilities, costs, demands, causes of action, damages and expenses arising in any way related to your breach of any of the provisions of these Terms.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7. Severability</h3>
          <p>If any provision of these Terms is found to be invalid under any applicable law, such provisions shall be deleted without affecting the remaining provisions herein.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">8. Variation of Terms</h3>
          <p>We are permitted to revise these Terms at any time as we see fit, and by using this website you are expected to review these Terms on a regular basis.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">9. Governing Law & Jurisdiction</h3>
          <p>These Terms will be governed by and interpreted in accordance with the laws of the United States, and you submit to the non-exclusive jurisdiction of the state and federal courts for the resolution of any disputes.</p>
        </div>
      </div>
      
      <button
        onClick={() => {
          setView('home');
          setMobileMenuOpen(false);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
  
  // Render Privacy Policy page
  const renderPrivacy = () => (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Privacy Policy</h2>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="prose max-w-none">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h3>
          <p>At BidRight.app, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data and tell you about your privacy rights.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">2. Data We Collect</h3>
          <p>We may collect, use, store and transfer different kinds of personal data about you, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Identity Data: Includes first name, last name, username or similar identifier</li>
            <li>Contact Data: Includes email address</li>
            <li>Technical Data: Includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform</li>
            <li>Usage Data: Includes information about how you use our website and services</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Data</h3>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>To provide you with the services you have requested</li>
            <li>To improve our website and services</li>
            <li>To send you marketing communications if you have opted in</li>
            <li>To comply with a legal or regulatory obligation</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h3>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">5. Data Retention</h3>
          <p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">6. Your Legal Rights</h3>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Right to withdraw consent</li>
          </ul>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">7. Cookies</h3>
          <p>We use cookies to distinguish you from other users of our website, which helps us to provide you with a good experience and improves our site.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">8. Changes to the Privacy Policy</h3>
          <p>We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.</p>
          
          <h3 className="text-xl font-semibold mt-6 mb-3">9. Contact Us</h3>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at support@bidright.app.</p>
        </div>
      </div>
      
      <button
        onClick={() => {
          setView('home');
          setMobileMenuOpen(false);
        }}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
      >
        Back to Home
      </button>
    </div>
  );
  
  // Feedback component 
  const FeedbackButton = () => {
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackType, setFeedbackType] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [feedbackError, setFeedbackError] = useState(null);
    
    const handleSubmitFeedback = () => {
      if (!feedbackType) {
        setFeedbackError("Please select a feedback type");
        return;
      }
      
      // In a real app, you would send this to your backend
      console.log("Feedback submitted:", { feedbackType, feedbackText });
      
      // Track the feedback event
      trackEvent('feedback_submitted', { 
        type: feedbackType
      });
      
      setFeedbackSubmitted(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSubmitted(false);
        setFeedbackType('');
        setFeedbackText('');
      }, 3000);
    };
    
    if (!showFeedback) {
      return (
        <button 
          onClick={() => setShowFeedback(true)}
          className="fixed bottom-20 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg z-30"
          aria-label="Provide feedback"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
      );
    }
    
    return (
      <div className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 z-30 w-80">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Share Your Feedback</h3>
          <button 
            onClick={() => setShowFeedback(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {feedbackSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-green-800 font-medium">
              Thank you for your feedback!
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">What kind of feedback do you have?</p>
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`px-3 py-1 text-sm rounded-full border ${feedbackType === 'suggestion' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400'}`}
                  onClick={() => setFeedbackType('suggestion')}
                >
                  Suggestion
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-full border ${feedbackType === 'issue' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400'}`}
                  onClick={() => setFeedbackType('issue')}
                >
                  Issue
                </button>
                <button 
                  className={`px-3 py-1 text-sm rounded-full border ${feedbackType === 'compliment' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-blue-400'}`}
                  onClick={() => setFeedbackType('compliment')}
                >
                  Compliment
                </button>
              </div>
              {feedbackError && <p className="text-red-600 text-xs mt-1">{feedbackError}</p>}
            </div>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            ></textarea>
            
            <button
              onClick={handleSubmitFeedback}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg w-full transition-colors"
            >
              Submit Feedback
            </button>
          </>
        )}
      </div>
    );
  };

  // Cookie consent banner
  const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(true);
    
    useEffect(() => {
      const consentGiven = localStorage.getItem('cookieConsent');
      if (consentGiven) {
        setShowBanner(false);
      }
    }, []);
    
    const acceptCookies = () => {
      localStorage.setItem('cookieConsent', 'true');
      setShowBanner(false);
      trackEvent('cookie_consent_accepted');
    };
    
    if (!showBanner) return null;
    
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm">
            <p>We use cookies to improve your experience on our site. By continuing to use BidRight.app, you consent to our use of cookies.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setView('privacy');
                setMobileMenuOpen(false);
              }}
              className="text-sm text-blue-300 hover:text-blue-100"
            >
              Privacy Policy
            </button>
            <button 
              onClick={acceptCookies}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // First-time user welcome dialog
  const WelcomeGuide = () => {
    const [showGuide, setShowGuide] = useState(true);
    
    useEffect(() => {
      const guideSeen = localStorage.getItem('welcomeGuideSeen');
      if (guideSeen) {
        setShowGuide(false);
      }
    }, []);
    
    const dismissGuide = () => {
      localStorage.setItem('welcomeGuideSeen', 'true');
      setShowGuide(false);
      trackEvent('welcome_guide_dismissed');
    };
    
    if (!showGuide || view !== 'home') return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-bold mb-2">Welcome to BidRight.app!</h3>
          <p className="mb-4">Stop undercharging for your freelance work with data-backed project estimates.</p>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <p>Select your industry and project type</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <p>Choose your project complexity</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <p>Add any special features you'll provide</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              <p>Get your professional estimate in seconds!</p>
            </div>
          </div>
          
          <button
            onClick={dismissGuide}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnalyticsManager trackEvent={trackEvent}>
      <div className="min-h-screen bg-gray-50" role="application" aria-label="BidRight freelance estimation application">
        <header className="bg-white shadow-sm" role="banner">
          <div className="max-w-6xl mx-auto py-4 px-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center justify-between">
              <h1 
                className="text-xl font-bold text-blue-800 cursor-pointer" 
                onClick={() => {
                  setView('home');
                  setMobileMenuOpen(false);
                }}
              >
                BidRight.app
              </h1>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-4 mt-4 md:mt-0`}>
              {savedEstimates.length > 0 && (
                <button 
                  className="text-blue-600 hover:text-blue-800 font-medium w-full md:w-auto text-center"
                  onClick={() => {
                    setView('saved');
                    trackEvent('view_saved_estimates');
                    setMobileMenuOpen(false);
                  }}
                >
                  My Estimates ({savedEstimates.length})
                </button>
              )}
              <button 
                className="text-blue-600 hover:text-blue-800 font-medium w-full md:w-auto text-center"
                onClick={() => handleAccountAction('Login')}
              >
                Login
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full md:w-auto"
                onClick={() => handleAccountAction('Sign Up')}
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </header>
        
        <main className="py-8" role="main">
          {view === 'home' && renderHome()}
          {view === 'estimator' && renderEstimator()}
          {view === 'result' && renderResult()}
          {view === 'saved' && renderSavedEstimates()}
          {view === 'terms' && renderTerms()}
          {view === 'privacy' && renderPrivacy()}
        </main>
        
        <footer className="bg-gray-800 text-gray-300 py-8 px-4" role="contentinfo">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold mb-4">BidRight.app</h3>
                <p className="text-sm">
                  The smart way to price your freelance projects and boost your profits.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-sm">
                  <li>Project Estimation</li>
                  <li>Cost Calculator</li>
                  <li>Timeline Planner</li>
                  <li>Proposal Generator</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>Pricing Guide</li>
                  <li>Freelance Blog</li>
                  <li>Case Studies</li>
                  <li>Support Center</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>About Us</li>
                  <li className="cursor-pointer hover:text-white" onClick={() => { setView('terms'); setMobileMenuOpen(false); }}>Terms of Service</li>
                  <li className="cursor-pointer hover:text-white" onClick={() => { setView('privacy'); setMobileMenuOpen(false); }}>Privacy Policy</li>
                  <li>Contact Us</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center">
              &copy; {new Date().getFullYear()} BidRight.app. All rights reserved.
            </div>
          </div>
        </footer>
        
        {/* Feedback button */}
        <FeedbackButton />
        
        {/* Beta indicator */}
        <div className="fixed top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 transform rotate-0 origin-top-right z-50" title="We're still improving - share your feedback!">
          BETA
        </div>
        
        {/* Modal for notifications */}
        <Modal />
        
        {/* Cookie consent banner */}
        <CookieBanner />
        
        {/* First-time user guide */}
        <WelcomeGuide />
      </div>
    </AnalyticsManager>
  );
};

export default App;