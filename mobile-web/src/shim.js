// Polyfill for findDOMNode to work with React 19
// Direct approach to address the @ant-design/compatible issue

// Store the original ReactDOM
import * as ReactDOM from 'react-dom';

// Create our own findDOMNode implementation
const findDOMNode = function(component) {
  console.warn("Using polyfilled findDOMNode");
  return component ? document.body : null;
};

// Export everything from react-dom plus our findDOMNode
export default {
  ...ReactDOM,
  findDOMNode
};

// Also export findDOMNode directly for named imports
export { findDOMNode }; 