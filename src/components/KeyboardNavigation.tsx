/**
 * Keyboard Navigation Component
 * Enhances keyboard accessibility
 */

import React, { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

interface KeyboardNavigationProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({
  shortcuts,
  enabled = true,
}) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // This is a behavior-only component
};

// Skip to Content Link
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg"
    >
      ข้ามไปยังเนื้อหาหลัก
    </a>
  );
};

// Focus Trap (for modals)
interface FocusTrapProps {
  active: boolean;
  children: React.ReactNode;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ active, children }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey as any);
    return () => container.removeEventListener('keydown', handleTabKey as any);
  }, [active]);

  return (
    <div ref={containerRef} role="dialog" aria-modal={active}>
      {children}
    </div>
  );
};

// Keyboard Shortcuts Help Modal
interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.alt) parts.push('Alt');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <FocusTrap active={isOpen}>
        <div
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="shortcuts-title"
          aria-describedby="shortcuts-description"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="shortcuts-title" className="text-2xl font-bold text-gray-900">
              แป้นพิมพ์ลัด
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
              aria-label="ปิด"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p id="shortcuts-description" className="text-gray-600 mb-4">
            ใช้แป้นพิมพ์ลัดเหล่านี้เพื่อนำทางในระบบได้เร็วขึ้น
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded-md"
              >
                <span className="text-gray-700">{shortcut.description}</span>
                <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm font-mono">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              ปิด
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const [showHelp, setShowHelp] = React.useState(false);

  // Add help shortcut
  const allShortcuts = [
    ...shortcuts,
    {
      key: '?',
      shift: true,
      description: 'แสดงแป้นพิมพ์ลัด',
      action: () => setShowHelp(true),
    },
  ];

  return {
    KeyboardNavigationComponent: () => (
      <>
        <KeyboardNavigation shortcuts={allShortcuts} />
        <KeyboardShortcutsHelp
          shortcuts={allShortcuts}
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
        />
      </>
    ),
    showHelp,
    setShowHelp,
  };
};
