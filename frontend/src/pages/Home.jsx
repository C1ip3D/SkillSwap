import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaExchangeAlt, FaVideo, FaTrophy, FaRobot } from 'react-icons/fa';

const Feature = ({ title, text, icon }) => {
  return (
    <Stack align='center' textAlign='center'>
      <Icon as={icon} w={10} h={10} color='brand.500' />
      <Text fontWeight={600}>{title}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
    </Stack>
  );
};

export default function Home() {
  return (
    <Box>
      <Container maxW='container.xl' py={20}>
        <Stack spacing={8} align='center' textAlign='center'>
          <Heading
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            bgGradient='linear(to-r, brand.400, brand.600)'
            bgClip='text'
            fontWeight='extrabold'
          >
            Exchange Skills in Real-Time
          </Heading>
          <Text fontSize={{ base: 'lg', md: 'xl' }} color='gray.600' maxW='2xl'>
            Connect with others instantly to learn and teach micro-skills
            through video, audio, or text chat. Join our community of learners
            and teachers today!
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              as={RouterLink}
              to='/register'
              size='lg'
              colorScheme='brand'
              px={8}
            >
              Get Started
            </Button>
            <Button
              as={RouterLink}
              to='/login'
              size='lg'
              variant='outline'
              px={8}
            >
              Sign In
            </Button>
          </Stack>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10} mt={20}>
          <Feature
            icon={FaExchangeAlt}
            title='Instant Exchange'
            text='Connect with others instantly for real-time skill exchange'
          />
          <Feature
            icon={FaVideo}
            title='Video Chat'
            text='High-quality video and audio communication'
          />
          <Feature
            icon={FaTrophy}
            title='Gamified Learning'
            text='Earn points and badges as you learn and teach'
          />
          <Feature
            icon={FaRobot}
            title='AI Matching'
            text='Smart skill matching powered by AI'
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}
