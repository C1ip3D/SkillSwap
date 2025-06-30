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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skills, exchanges } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: availableSkills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['skills-browse'],
    queryFn: skills.browse,
    refetchInterval: 5000,
  });

  const { data: exchangeRequests, isLoading: isLoadingExchanges } = useQuery({
    queryKey: ['exchanges'],
    queryFn: exchanges.list,
    enabled: isAuthenticated && !!token,
    refetchInterval: 5000,
  });

  const createExchangeMutation = useMutation({
    mutationFn: (skillId) => exchanges.create({ skillId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      toast({
        title: 'Exchange request sent!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send exchange request',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const acceptExchangeMutation = useMutation({
    mutationFn: ({ id }) => exchanges.updateStatus(id, 'active'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      toast({
        title: 'Exchange accepted!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to accept exchange',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const rejectExchangeMutation = useMutation({
    mutationFn: ({ id }) => exchanges.updateStatus(id, 'rejected'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      toast({
        title: 'Exchange rejected.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to reject exchange',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const cancelExchangeMutation = useMutation({
    mutationFn: (id) => exchanges.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      toast({
        title: 'Exchange cancelled.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel exchange',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    },
  });

  const handleRequestExchange = (skill) => {
    const skillId = skill._id || skill.id;
    if (!skillId) {
      toast({
        title: 'Error',
        description: 'Skill ID is missing. Cannot request exchange.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }
    createExchangeMutation.mutate(skillId);
  };

  const handleJoinExchange = (exchange) => {
    const skillId = exchange.skill.id;
    navigate(`/exchange/${skillId}`);
  };

  // Debug: log user and exchangeRequests
  console.log('user:', user);
  console.log('exchangeRequests:', exchangeRequests);

  // Use the correct user id property for filtering
  const userId = user?.user_id || user?.uid || user?.id;
  const incomingRequests = exchangeRequests?.filter(e => e.teacher === userId) || [];
  console.log('incomingRequests:', incomingRequests);
  const myRequests = exchangeRequests?.filter(e => e.student === userId) || [];

  // Helper: check if user has already requested this skill
  const hasRequestedSkill = (skillId) =>
    myRequests.some(
      (ex) =>
        ex.skill?.id === skillId &&
        (ex.status === 'pending' || ex.status === 'active')
    );

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
              {availableSkills && availableSkills.length === 0 && (
                <Text color='gray.500'>No skills are available right now.</Text>
              )}
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
                        onClick={() => handleRequestExchange(skill)}
                        isLoading={createExchangeMutation.isLoading}
                        isDisabled={hasRequestedSkill(skill._id || skill.id)}
                      >
                        {hasRequestedSkill(skill._id || skill.id) ? 'Requested' : 'Request Exchange'}
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
            <Tabs variant='enclosed'>
              <TabList>
                <Tab>
                  Incoming Requests{' '}
                  <Badge ml={2} colorScheme='blue'>{incomingRequests.length}</Badge>
                </Tab>
                <Tab>
                  My Requests{' '}
                  <Badge ml={2} colorScheme='green'>{myRequests.length}</Badge>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Stack spacing={4}>
                    {incomingRequests.length === 0 && (
                      <Text color='gray.500'>No incoming requests.</Text>
                    )}
                    {incomingRequests.map((exchange) => {
                      const isPending = exchange.status === 'pending';
                      const skillTitle = exchange.skill?.title || 'Skill';
                      return (
                        <Card key={exchange.id}>
                          <CardHeader>
                            <Heading size='sm'>
                              {skillTitle} for {exchange.studentName || 'Student'}
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            <Stack spacing={3}>
                              <Text>Status: {exchange.status}</Text>
                              {isPending && (
                                <Stack direction='row' spacing={2}>
                                  <Button
                                    colorScheme='green'
                                    onClick={() => acceptExchangeMutation.mutate({ id: exchange.id })}
                                    isLoading={acceptExchangeMutation.isLoading}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    colorScheme='red'
                                    onClick={() => rejectExchangeMutation.mutate({ id: exchange.id })}
                                    isLoading={rejectExchangeMutation.isLoading}
                                  >
                                    Reject
                                  </Button>
                                </Stack>
                              )}
                              <Button
                                colorScheme='brand'
                                onClick={() => handleJoinExchange(exchange)}
                                isDisabled={exchange.status !== 'active'}
                              >
                                Join Exchange
                              </Button>
                            </Stack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </Stack>
                </TabPanel>
                <TabPanel>
                  <Stack spacing={4}>
                    {myRequests.length === 0 && (
                      <Text color='gray.500'>You haven't requested any exchanges.</Text>
                    )}
                    {myRequests.map((exchange) => {
                      const isPending = exchange.status === 'pending';
                      const skillTitle = exchange.skill?.title || 'Skill';
                      return (
                        <Card key={exchange.id}>
                          <CardHeader>
                            <Heading size='sm'>
                              {skillTitle} with {exchange.teacherName || 'Teacher'}
                            </Heading>
                          </CardHeader>
                          <CardBody>
                            <Stack spacing={3}>
                              <Text>Status: {exchange.status}</Text>
                              {isPending && (
                                <Button
                                  colorScheme='red'
                                  variant='outline'
                                  onClick={() => cancelExchangeMutation.mutate(exchange.id)}
                                  isLoading={cancelExchangeMutation.isLoading}
                                >
                                  Cancel Exchange
                                </Button>
                              )}
                              <Button
                                colorScheme='brand'
                                onClick={() => handleJoinExchange(exchange)}
                                isDisabled={exchange.status !== 'active'}
                              >
                                Join Exchange
                              </Button>
                            </Stack>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Grid>
      </Stack>
    </Container>
  );
}
