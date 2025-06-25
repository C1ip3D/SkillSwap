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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
