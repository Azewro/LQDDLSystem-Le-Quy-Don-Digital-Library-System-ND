import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';

/**
 * SpeedInsights Component
 * 
 * This component integrates Vercel Speed Insights into the application.
 * Speed Insights helps monitor and analyze Core Web Vitals and other performance metrics.
 * 
 * The component is mounted at the root level to track performance across the entire app.
 * No configuration is needed - it works out of the box after Vercel deployment.
 * 
 * @see https://vercel.com/docs/speed-insights
 */
const SpeedInsightsComponent: React.FC = () => {
  return <SpeedInsights />;
};

export default SpeedInsightsComponent;
