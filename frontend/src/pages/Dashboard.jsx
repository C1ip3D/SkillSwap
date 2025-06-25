import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Stack,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { skills, exchanges } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: availableSkills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills'],
    queryFn: skills.list,
  });

  const { data: exchangeRequests, isLoading: isLoadingExchanges } = useQuery({
    queryKey: ['exchanges'],
    queryFn: exchanges.list,
    enabled: isAuthenticated && !!token,
  });

  const handleStartExchange = (skill) => {
    const skillId = skill._id || skill.id;
    if (!skillId) {
      toast({
        title: 'Error',
        description: 'Skill ID is missing. Cannot start exchange.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    navigate(`/exchange/${skillId}`);
  };

  if (isLoadingSkills || isLoadingExchanges) {
    return (
      <Container maxW='container.xl' py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container maxW='container.xl' py={8}>
      <Stack spacing={8}>
        <Box>
          <Heading size='lg' mb={2}>
            Welcome back, {user?.name}!
          </Heading>
          <Text color='gray.600'>
            Find skills to learn or offer your expertise to others.
          </Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
          <Box>
            <Heading size='md' mb={4}>
              Available Skills
            </Heading>
            <Stack spacing={4}>
              {availableSkills?.map((skill) => (
                <Card key={skill._id || skill.id}>
                  <CardHeader>
                    <Heading size='sm'>{skill.title}</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={3}>
                      <Text>{skill.description}</Text>
                      <Stack direction='row' spacing={2}>
                        {skill.tags.map((tag) => (
                          <Badge key={tag} colorScheme='brand'>
                            {tag}
                          </Badge>
                        ))}
                      </Stack>
                      <Button
                        colorScheme='brand'
                        onClick={() => handleStartExchange(skill)}
                      >
                        Start Exchange
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </Box>

          <Box>
            <Heading size='md' mb={4}>
              Exchange Requests
            </Heading>
            <Stack spacing={4}>
              {exchangeRequests?.map((exchange) => (
                <Card key={exchange._id || exchange.id}>
                  <CardHeader>
                    <Heading size='sm'>
                      {exchange.skill.title} with {exchange.participant.name}
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={3}>
                      <Text>{exchange.status}</Text>
                      <Button
                        colorScheme='brand'
                        onClick={() => handleStartExchange(exchange.skill)}
                      >
                        Join Exchange
                      </Button>
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Stack>
    </Container>
  );
}
