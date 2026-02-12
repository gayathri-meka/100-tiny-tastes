"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
          <p className="text-4xl mb-3">😕</p>
          <h2 className="text-lg font-semibold text-stone-700 mb-1">
            Something went wrong
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-warm-500 text-white text-sm font-medium rounded-xl"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
