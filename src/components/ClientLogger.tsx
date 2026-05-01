'use client';
import { useEffect } from 'react';

export function ClientLogger() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // To prevent infinite loops if fetch fails and logs an error
    let isSending = false;

    const sendLog = async (level: string, args: any[]) => {
      if (isSending) return;
      isSending = true;
      try {
        const parsedArgs = args.map(arg => {
          if (arg instanceof Error) {
            return `${arg.name}: ${arg.message}\n${arg.stack}`;
          }
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          }
          return String(arg);
        });

        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, args: parsedArgs })
        });
      } catch (e) {
        // Silently ignore to avoid triggering another console.error
      } finally {
        isSending = false;
      }
    };

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog.apply(console, args);
      sendLog('log', args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      sendLog('error', args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      sendLog('warn', args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
