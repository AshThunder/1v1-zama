import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface FHELoggerProps {
  isVisible?: boolean;
  className?: string;
}

export const FHELogger: React.FC<FHELoggerProps> = ({ 
  isVisible = false, 
  className 
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const originalConsoleLog = useRef<typeof console.log>();
  const originalConsoleError = useRef<typeof console.error>();
  const originalConsoleWarn = useRef<typeof console.warn>();

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    toast.success('Logs copied to clipboard');
  };

  useEffect(() => {
    if (!isVisible) return;

    // Store original console methods
    originalConsoleLog.current = console.log;
    originalConsoleError.current = console.error;
    originalConsoleWarn.current = console.warn;

    // Override console methods to capture FHE-related logs
    console.log = (...args: any[]) => {
      const message = args.join(' ');
      if (message.toLowerCase().includes('fhe') || 
          message.toLowerCase().includes('encrypt') ||
          message.toLowerCase().includes('relayer') ||
          message.toLowerCase().includes('zama') ||
          message.toLowerCase().includes('sdk') ||
          message.toLowerCase().includes('gateway') ||
          message.toLowerCase().includes('contract') ||
          message.toLowerCase().includes('proof') ||
          message.toLowerCase().includes('instance')) {
        addLog(message, 'info');
      }
      originalConsoleLog.current?.(...args);
    };

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      if (message.toLowerCase().includes('fhe') || 
          message.toLowerCase().includes('encrypt') ||
          message.toLowerCase().includes('relayer') ||
          message.toLowerCase().includes('zama')) {
        addLog(message, 'error');
      }
      originalConsoleError.current?.(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.toLowerCase().includes('fhe') || 
          message.toLowerCase().includes('encrypt') ||
          message.toLowerCase().includes('relayer') ||
          message.toLowerCase().includes('zama')) {
        addLog(message, 'warning');
      }
      originalConsoleWarn.current?.(...args);
    };

    // Add initial log
    addLog('FHE Logger initialized - monitoring encryption process...', 'success');

    return () => {
      // Restore original console methods
      if (originalConsoleLog.current) console.log = originalConsoleLog.current;
      if (originalConsoleError.current) console.error = originalConsoleError.current;
      if (originalConsoleWarn.current) console.warn = originalConsoleWarn.current;
    };
  }, [isVisible]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isVisible) return null;

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Card className={cn("bg-gray-900 border-gray-700", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-electric-cyan text-sm font-mono">
            <Terminal className="w-4 h-4" />
            FHE Encryption Logs
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyLogs}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearLogs}
              className="text-gray-400 hover:text-white text-xs px-2 h-6"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div 
            ref={logContainerRef}
            className="bg-black rounded border border-gray-700 p-3 h-48 overflow-y-auto font-mono text-xs"
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 italic">Waiting for FHE operations...</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="mb-1 break-words">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span className={getLogColor(log.type)}>{log.message}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {logs.length} log entries • Auto-scrolling enabled
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default FHELogger;
