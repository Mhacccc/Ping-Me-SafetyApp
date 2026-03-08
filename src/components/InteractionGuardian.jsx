import { useEffect } from 'react';

/**
 * Global Interaction Guardian
 * Provides PWA Native-Feel by globally disabling context menus and image dragging.
 * Allows safe opt-outs for inputs and specific marked elements.
 */
export default function InteractionGuardian({ children }) {
    useEffect(() => {
        const handleContextMenu = (e) => {
            // 1. Allow context menus inside inputs and textareas (for copy/paste)
            // 2. Allow context menus on elements explicitly marked with .allow-select
            const target = e.target;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
            const isSelectable = target.closest('.allow-select');

            if (!isInput && !isSelectable) {
                e.preventDefault();
            }
        };

        const handleDragStart = (e) => {
            // Prevent all image and link dragging globally, unless marked
            const target = e.target;
            const isDraggable = target.closest('.allow-drag');
            if ((target.tagName === 'IMG' || target.tagName === 'A') && !isDraggable) {
                e.preventDefault();
            }
        };

        // Attach listeners globally to the window
        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('dragstart', handleDragStart);

        // Cleanup listeners on unmount
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    return children;
}
