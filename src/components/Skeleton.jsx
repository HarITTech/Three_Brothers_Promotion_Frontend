import React from 'react';

/**
 * Reusable Skeleton component
 * @param {string} type - 'text' | 'title' | 'circle' | 'rect' | 'icon' | 'btn'
 * @param {string} width - Custom width (e.g., '100px', '50%')
 * @param {string} height - Custom height (e.g., '20px')
 * @param {object} style - Additional styles
 * @param {string} className - Additional classes
 */
export default function Skeleton({ 
  type = 'text', 
  width, 
  height, 
  style = {}, 
  className = '' 
}) {
  const baseClass = `skeleton skeleton-${type} ${className}`;
  const customStyle = {
    ...style,
    width: width || style.width,
    height: height || style.height
  };

  return <span className={baseClass} style={customStyle} />;
}
