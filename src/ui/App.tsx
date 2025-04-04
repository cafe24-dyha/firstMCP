import * as React from 'react';
import '../styles/ui.css';

export function App() {
  return (
    <div className="container">
      <h2>CDS Maker</h2>
      <div className="button-container">
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'create-cds' }}, '*')}>
          Create CDS
        </button>
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'update-components' }}, '*')}>
          Update Components
        </button>
        <button onClick={() => parent.postMessage({ pluginMessage: { type: 'export-styles' }}, '*')}>
          Export Styles
        </button>
      </div>
    </div>
  );
}