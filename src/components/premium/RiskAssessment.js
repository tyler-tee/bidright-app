// src/components/premium/RiskAssessment.js - Fixed with default case
import React from 'react';
import { usePremiumFeatures } from '../../contexts/PremiumFeaturesContext';

/**
 * Risk assessment component for Pro users
 * Shows potential project risks and mitigation strategies
 */
const RiskAssessment = ({ 
  industry, 
  projectType, 
  complexity, 
  features 
}) => {
  const { hasFeature } = usePremiumFeatures();
  const isPremiumFeature = hasFeature('risk_assessment');
  
  // If user doesn't have premium feature access, show upgrade prompt
  if (!isPremiumFeature) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Project Risk Assessment</h3>
        <p className="text-gray-600 mb-4">
          Identify potential project risks and get recommendations for mitigating them.
          Help ensure your project stays on track and avoid scope creep.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Upgrade to Pro
        </button>
      </div>
    );
  }
  
  // Generate risks based on project details
  const risks = generateRisks(industry, projectType, complexity, features);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-yellow-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">Project Risk Assessment</h3>
        <p className="text-yellow-100 text-sm">Potential risks and mitigation strategies</p>
      </div>
      
      <div className="p-6">
        {risks.map((risk, index) => (
          <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
            <div className="flex items-start mb-2">
              <div className={`text-white text-xs font-bold px-2 py-1 rounded-full ${getRiskLevelClass(risk.level)} mr-2`}>
                {risk.level}
              </div>
              <h4 className="font-semibold">{risk.name}</h4>
            </div>
            <p className="text-gray-600 mb-2">{risk.description}</p>
            <div>
              <span className="text-sm font-semibold text-gray-700">Mitigation: </span>
              <span className="text-sm text-gray-600">{risk.mitigation}</span>
            </div>
          </div>
        ))}
        
        {risks.length === 0 && (
          <p className="text-gray-600 text-center py-4">
            No significant risks identified for this project.
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Get the CSS class for a risk level
 */
function getRiskLevelClass(level) {
  switch (level.toLowerCase()) {
    case 'high':
      return 'bg-red-600';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-600';
    default:
      return 'bg-gray-600';
  }
}

/**
 * Generate risks based on project type, industry, complexity
 */
function generateRisks(industry, projectType, complexity, features) {
  const risks = [];
  
  // Common risks based on complexity
  if (complexity === 'high' || complexity === 'expert') {
    risks.push({
      name: 'Scope Creep',
      level: 'High',
      description: 'Complex projects are prone to expanding requirements and unexpected challenges.',
      mitigation: 'Document detailed requirements upfront and use change orders for scope additions.'
    });
  }
  
  // Industry-specific risks
  switch (industry) {
    case 'webdev':
      if (projectType === 'ecommerce') {
        risks.push({
          name: 'Payment Integration Complexity',
          level: 'Medium',
          description: 'Payment gateways may require additional security measures and testing.',
          mitigation: 'Allow extra time for payment testing and consult security best practices.'
        });
      }
      
      if (features.includes('api')) {
        risks.push({
          name: 'External API Dependency',
          level: 'Medium',
          description: 'Reliance on third-party APIs introduces potential points of failure.',
          mitigation: 'Build fallback mechanisms and monitor API status regularly.'
        });
      }
      break;
      
    case 'design':
      risks.push({
        name: 'Subjective Feedback Cycles',
        level: 'Medium',
        description: 'Design work is subjective and may lead to multiple revision cycles.',
        mitigation: 'Set clear revision limits and use design questionnaires to clarify preferences early.'
      });
      
      if (features.includes('rush')) {
        risks.push({
          name: 'Rushed Timeline',
          level: 'High',
          description: 'Accelerated timeline may compromise quality or increase stress.',
          mitigation: 'Clarify which elements can be simplified to meet the timeline while preserving quality.'
        });
      }
      break;
      
    // Add more industry-specific risks as needed
    default:
      // Default case for any other industry
      risks.push({
        name: 'General Project Risk',
        level: 'Medium',
        description: 'All projects carry inherent risks related to timeline, scope, and quality expectations.',
        mitigation: 'Clear communication, detailed contracts, and regular progress updates help mitigate general project risks.'
      });
      break;
  }
  
  // Add general risks based on complexity
  if (complexity === 'high' || complexity === 'expert') {
    risks.push({
      name: 'Timeline Uncertainty',
      level: 'Medium',
      description: 'Complex projects often encounter unexpected challenges that affect timelines.',
      mitigation: 'Build a 20% buffer into your timeline estimates and communicate it with the client.'
    });
  }
  
  return risks;
}

export default RiskAssessment;