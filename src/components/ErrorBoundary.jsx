import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Log if needed
    console.error("ErrorBoundary caught error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">A UI error occurred. You can reload the page to continue.</p>
            <button onClick={this.handleReload} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
