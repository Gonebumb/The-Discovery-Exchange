import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Unexpected application error.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('TDEX ErrorBoundary caught error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#071936] text-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#0f2347] border border-[#dfa62a]/60 rounded-xl p-6 space-y-4">
            <h1 className="font-serif text-xl font-bold text-[#fcd34d]">
              Protected Safety Halt Triggered
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed">
              An internal operation or permission guard interrupted the current view. No changes
              were committed outside security rules.
            </p>
            <div className="p-3 rounded bg-slate-950/70 border border-slate-700 font-mono text-xs text-slate-300 break-words">
              {this.state.message}
            </div>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-lg bg-[#dfa62a] text-[#071936] text-xs font-bold cursor-pointer"
            >
              Return to Safe Home View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
