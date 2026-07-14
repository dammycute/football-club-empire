import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center text-center gap-4 my-2">
          <div className="w-14 h-14 rounded-full bg-rose-950/30 flex items-center justify-center border border-rose-900/40">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Something went wrong</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              A rendering error occurred in this panel. The rest of the game is unaffected.
            </p>
            {this.state.error && (
              <p className="text-[10px] font-mono text-rose-500 mt-2 max-w-sm mx-auto truncate">
                {this.state.error.message}
              </p>
            )}
          </div>
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Panel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
