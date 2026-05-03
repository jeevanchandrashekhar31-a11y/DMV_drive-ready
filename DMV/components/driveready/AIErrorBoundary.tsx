"use client";

import { Component, type ReactNode } from "react";

interface AIErrorBoundaryProps {
  children: ReactNode;
}

interface AIErrorBoundaryState {
  hasError: boolean;
}

export default class AIErrorBoundary extends Component<AIErrorBoundaryProps, AIErrorBoundaryState> {
  state: AIErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AIErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
