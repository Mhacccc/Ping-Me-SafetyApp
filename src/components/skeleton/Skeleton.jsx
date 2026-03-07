import React from 'react';
import './Skeleton.css';

/**
 * A highly reusable, sci-fi "shimmering red light" loading skeleton.
 * 
 * @param {string} type - 'text' | 'title' | 'avatar' | 'thumbnail' | 'custom'
 * @param {string} width - CSS width value (e.g. '100%', '48px')
 * @param {string} height - CSS height value (e.g. '20px', '2rem')
 * @param {boolean} lightTheme - Toggle for bright backgrounds
 * @param {string} className - Additional CSS classes
 */
const Skeleton = ({
    type = 'text',
    width,
    height,
    lightTheme = false,
    className = ''
}) => {
    // Determine the shape class based on the type prop
    const shapeClass = type !== 'custom' ? `skeleton-${type}` : '';
    const themeClass = lightTheme ? 'skeleton-light' : '';

    // Combine base class with modifiers and any custom classes
    const finalClassName = `skeleton ${shapeClass} ${themeClass} ${className}`.trim();

    // If width/height are not provided, we rely on CSS defaults or the parent flex context.
    // For standard usage, passing explicit dimensions e.g. width="100%" height="24px" is recommended.
    const inlineStyles = {};
    if (width) inlineStyles.width = width;
    if (height) inlineStyles.height = height;

    return (
        <div className={finalClassName} style={inlineStyles} aria-hidden="true" />
    );
};

export default Skeleton;
