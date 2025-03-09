// src/components/premium/ProjectBreakdown.js
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Project breakdown component for Premium users
 * Shows detailed task breakdown with time and cost estimates
 */
const ProjectBreakdown = ({ 
  industry, 
  projectType, 
  complexity, 
  features, 
  estimate, 
  isUserPremium = false 
}) => {
  const [tasks, setTasks] = useState(generateTaskBreakdown(industry, projectType, complexity, features, estimate));
  
  // If user is not premium, show upgrade prompt
  if (!isUserPremium) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Detailed Project Breakdown</h3>
        <p className="text-gray-600 mb-4">
          Unlock detailed task breakdowns with time and cost estimates for each project phase.
          Perfect for creating accurate client proposals and managing project timelines.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Upgrade to Pro
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-blue-600 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">Project Task Breakdown</h3>
        <p className="text-blue-100 text-sm">Estimated hours and costs by project phase</p>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left border-b border-gray-200 font-semibold">Task</th>
                <th className="px-4 py-2 text-center border-b border-gray-200 font-semibold">Hours</th>
                <th className="px-4 py-2 text-right border-b border-gray-200 font-semibold">Cost</th>
                <th className="px-4 py-2 text-center border-b border-gray-200 font-semibold">% of Project</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 border-b border-gray-200">{task.name}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-center">{task.hours}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-right">{formatCurrency(task.cost)}</td>
                  <td className="px-4 py-3 border-b border-gray-200 text-center">{task.percentage}%</td>
                </tr>
              ))}
              <tr className="bg-blue-50 font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-center">{estimate.hours}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(estimate.cost)}</td>
                <td className="px-4 py-3 text-center">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * Generate a breakdown of tasks based on the project type and industry
 */
function generateTaskBreakdown(industry, projectType, complexity, features, estimate) {
  // This is a placeholder implementation - in a real app, you'd have
  // more sophisticated logic based on industry standards
  
  const totalHours = estimate.hours;
  const totalCost = estimate.cost;
  
  // Default task breakdown structure with adjustments based on project type
  let taskStructure = [];
  
  switch (industry) {
    case 'webdev':
      taskStructure = [
        { name: 'Project Planning & Requirements', percentage: 10 },
        { name: 'UI/UX Design', percentage: 15 },
        { name: 'Frontend Development', percentage: 30 },
        { name: 'Backend Development', percentage: 30 },
        { name: 'Testing & Quality Assurance', percentage: 10 },
        { name: 'Deployment & Documentation', percentage: 5 }
      ];
      
      // Adjust for e-commerce
      if (projectType === 'ecommerce') {
        taskStructure = [
          { name: 'Project Planning & Requirements', percentage: 10 },
          { name: 'UI/UX Design', percentage: 15 },
          { name: 'Frontend Development', percentage: 20 },
          { name: 'Backend & Database Design', percentage: 20 },
          { name: 'Payment Integration', percentage: 15 },
          { name: 'Product Management System', percentage: 10 },
          { name: 'Testing & Quality Assurance', percentage: 5 },
          { name: 'Deployment & Documentation', percentage: 5 }
        ];
      }
      
      // Adjust if has CMS feature
      if (features.includes('cms')) {
        taskStructure.push({ name: 'CMS Setup & Configuration', percentage: 15 });
        // Normalize percentages
        const totalPercentage = taskStructure.reduce((sum, task) => sum + task.percentage, 0);
        taskStructure = taskStructure.map(task => ({
          ...task,
          percentage: Math.round((task.percentage / totalPercentage) * 100)
        }));
      }
      break;
      
    case 'design':
      taskStructure = [
        { name: 'Research & Concept Development', percentage: 20 },
        { name: 'Initial Sketches & Concepts', percentage: 15 },
        { name: 'Design Refinement', percentage: 30 },
        { name: 'Client Revisions', percentage: 20 },
        { name: 'Final Production Files', percentage: 15 }
      ];
      break;
      
    case 'writing':
      taskStructure = [
        { name: 'Research & Outline', percentage: 25 },
        { name: 'Initial Draft', percentage: 40 },
        { name: 'Revisions & Editing', percentage: 25 },
        { name: 'Final Formatting', percentage: 10 }
      ];
      break;
      
    case 'marketing':
      taskStructure = [
        { name: 'Strategy Development', percentage: 20 },
        { name: 'Content Creation', percentage: 25 },
        { name: 'Campaign Setup', percentage: 20 },
        { name: 'Optimization & Management', percentage: 25 },
        { name: 'Reporting & Analysis', percentage: 10 }
      ];
      break;
      
    case 'video':
      taskStructure = [
        { name: 'Pre-production & Planning', percentage: 15 },
        { name: 'Shooting/Recording', percentage: 25 },
        { name: 'Editing & Post-production', percentage: 40 },
        { name: 'Audio Mastering', percentage: 10 },
        { name: 'Final Delivery & Revisions', percentage: 10 }
      ];
      break;
      
    default:
      taskStructure = [
        { name: 'Research & Planning', percentage: 20 },
        { name: 'Development', percentage: 50 },
        { name: 'Testing & Refinement', percentage: 20 },
        { name: 'Delivery & Documentation', percentage: 10 }
      ];
  }
  
  // Calculate hours and cost for each task
  return taskStructure.map(task => ({
    ...task,
    hours: Math.round((task.percentage / 100) * totalHours),
    cost: Math.round((task.percentage / 100) * totalCost / 50) * 50 // Round to nearest $50
  }));
}

export default ProjectBreakdown;