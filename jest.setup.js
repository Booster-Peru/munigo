// Mocking expo globals that cause ReferenceError during initialization
global.__ExpoImportMetaRegistry = { ImportMetaRegistry: {} };

// Mocking structuredClone which is missing in node < 17 or causes issues in native environment
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockIcon = (props) => React.createElement(View, { testID: `ionicon-${props.name}` });
  return { Ionicons: MockIcon };
});

// Mock lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockIcon = (name) => (props) => {
    return React.createElement(View, { ...props, testID: `lucide-icon-${name}` });
  };

  return {
    Bell: MockIcon('Bell'),
    Search: MockIcon('Search'),
    MapPin: MockIcon('MapPin'),
    ChevronRight: MockIcon('ChevronRight'),
    AlertCircle: MockIcon('AlertCircle'),
    CheckCircle2: MockIcon('CheckCircle2'),
    Clock: MockIcon('Clock'),
    Plus: MockIcon('Plus'),
    Home: MockIcon('Home'),
    Map: MockIcon('Map'),
    TrendingUp: MockIcon('TrendingUp'),
    User: MockIcon('User'),
  };
});
