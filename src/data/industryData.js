// Industry benchmark data
export const industries = [
    { id: 'webdev', name: 'Web Development', icon: '💻' },
    { id: 'design', name: 'Graphic Design', icon: '🎨' },
    { id: 'writing', name: 'Content Writing', icon: '✍️' },
    { id: 'marketing', name: 'Digital Marketing', icon: '📈' },
    { id: 'video', name: 'Video Production', icon: '🎬' },
  ];
  
  export const projectTypes = {
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
  
  export const featureOptions = {
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
  
  export const complexityMultipliers = {
    'low': { hourMod: 0.8, costMod: 0.9 },
    'medium': { hourMod: 1, costMod: 1 },
    'high': { hourMod: 1.5, costMod: 1.3 },
    'expert': { hourMod: 2, costMod: 1.8 },
  };