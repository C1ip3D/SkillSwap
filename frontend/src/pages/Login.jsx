import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Container,
  Heading,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { auth } from '../lib/api.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || error.message || 'Failed to login',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await auth.forgotPassword(forgotEmail);
      toast({
        title: 'Password reset email sent',
        description: 'Check your inbox for a reset link.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setShowForgot(false);
      setForgotEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to send reset email',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Container
      maxW='lg'
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing='8'>
        <Stack spacing='6' align='center'>
          <Heading size='lg'>Welcome back</Heading>
          <Text color='gray.600'>
            Don't have an account?{' '}
            <RouterLink to='/register' style={{ color: '#0967D2' }}>
              Sign up
            </RouterLink>
          </Text>
        </Stack>

        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={{ base: 'transparent', sm: 'white' }}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          {error && (
            <Alert status='error' mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Stack spacing='6'>
            <form onSubmit={handleEmailLogin}>
              <Stack spacing='5'>
                <FormControl>
                  <FormLabel htmlFor='email'>Email</FormLabel>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor='password'>Password</FormLabel>
                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormControl>

                <Text fontSize='sm' color='blue.500' cursor='pointer' onClick={() => setShowForgot((v) => !v)}>
                  Forgot Password?
                </Text>
                {showForgot && (
                  <form onSubmit={handleForgotPassword}>
                    <Stack spacing={3} mt={2} mb={2}>
                      <Input
                        type='email'
                        placeholder='Enter your email'
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                      <Button
                        type='submit'
                        colorScheme='blue'
                        isLoading={forgotLoading}
                      >
                        Send Reset Email
                      </Button>
                    </Stack>
                  </form>
                )}

                <Button
                  type='submit'
                  colorScheme='brand'
                  size='lg'
                  fontSize='md'
                  isLoading={isLoading}
                >
                  Sign in with Email
                </Button>
              </Stack>
            </form>
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
