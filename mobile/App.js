import React, { useEffect } from 'react';
import AppNavigator from './navigation/AppNavigation';
import { initDB } from './services/database';

export default function App() {
  useEffect(() => {
    initDB(); // Create complaints table on app launch
  }, []);

  return <AppNavigator />;
}