import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main className="fatal"><h1>Tapline needs a refresh</h1><p>Your stored records have not been cleared. Reload the page to try again.</p><button onClick={() => location.reload()}>Reload</button><details><summary>Error details</summary><pre>{this.state.error.message}</pre></details></main>;
    return this.props.children;
  }
}
createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);
