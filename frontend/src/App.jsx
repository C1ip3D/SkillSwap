import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth.js';
import theme from './theme.js';
import Layout from './components/Layout.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SkillExchange from './pages/SkillExchange.jsx';
import Profile from './pages/Profile.jsx';

// Create a client
const queryClient = new QueryClient();

function App() {
  // Remove initAuth, just use useAuth for state
  useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Router>
          <Layout>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/exchange/:skillId' element={<SkillExchange />} />
              <Route path='/profile' element={<Profile />} />
            </Routes>
          </Layout>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
