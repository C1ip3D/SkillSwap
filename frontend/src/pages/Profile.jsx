import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Heading,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Stack,
  useToast,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  IconButton,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skills } from '../lib/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { CloseIcon } from '@chakra-ui/icons';

export default function Profile() {
  const { user } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState({
    title: '',
    description: '',
    tags: '',
    level: 'intermediate',
  });

  const { data: userSkills, isLoading } = useQuery({
    queryKey: ['user-skills'],
    queryFn: () => skills.list(),
  });

  const createSkillMutation = useMutation({
    mutationFn: (skill) => skills.create(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-skills'] });
      setNewSkill({
        title: '',
        description: '',
        tags: '',
        level: 'intermediate',
      });
      toast({
        title: 'Skill added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add skill',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id) => skills.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-skills'] });
      toast({
        title: 'Skill removed',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove skill',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleAddSkill = (e) => {
    e.preventDefault();
    createSkillMutation.mutate({
      ...newSkill,
      tags: newSkill.tags.split(',').map((tag) => tag.trim()),
    });
  };

  if (isLoading) {
    return (
      <Container maxW='container.xl' py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container maxW='container.xl' py={8}>
      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
        <GridItem>
          <VStack spacing={6} align='stretch'>
            <Card>
              <CardBody>
                <VStack spacing={4} align='center'>
                  <Avatar size='2xl' name={user?.name} src={user?.avatar} />
                  <Heading size='md'>{user?.name}</Heading>
                  <Text color='gray.600'>{user?.email}</Text>
                </VStack>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size='md'>Add New Skill</Heading>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleAddSkill}>
                  <Stack spacing={4}>
                    <FormControl>
                      <FormLabel>Title</FormLabel>
                      <Input
                        value={newSkill.title}
                        onChange={(e) =>
                          setNewSkill((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        value={newSkill.description}
                        onChange={(e) =>
                          setNewSkill((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        required
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tags (comma-separated)</FormLabel>
                      <Input
                        value={newSkill.tags}
                        onChange={(e) =>
                          setNewSkill((prev) => ({
                            ...prev,
                            tags: e.target.value,
                          }))
                        }
                        placeholder='e.g., programming, music, cooking'
                        required
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Level</FormLabel>
                      <HStack>
                        {['beginner', 'intermediate', 'advanced'].map(
                          (level) => (
                            <Button
                              key={level}
                              size='sm'
                              colorScheme={
                                newSkill.level === level ? 'brand' : 'gray'
                              }
                              onClick={() =>
                                setNewSkill((prev) => ({ ...prev, level }))
                              }
                            >
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </Button>
                          )
                        )}
                      </HStack>
                    </FormControl>

                    <Button
                      type='submit'
                      colorScheme='brand'
                      isLoading={createSkillMutation.isPending}
                    >
                      Add Skill
                    </Button>
                  </Stack>
                </form>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack spacing={6} align='stretch'>
            <Heading size='lg'>Your Skills</Heading>
            <Stack spacing={4}>
              {userSkills?.map((skill) => (
                <Card key={skill._id || skill.id} position='relative'>
                  <CardHeader>
                    <HStack justify='space-between' align='flex-start'>
                      <Heading size='sm'>{skill.title}</Heading>
                      <Badge colorScheme='brand' alignSelf='flex-start'>
                        {skill.level}
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody display='flex' flexDirection='column' justifyContent='center' minHeight='120px' position='relative'>
                    <Text mb={4} width='100%' align='left'>
                      {skill.description}
                    </Text>
                    <HStack spacing={2} mt={2} mb={8} justify='flex-start'>
                      {skill.tags.map((tag) => (
                        <Badge key={tag} colorScheme='brand'>
                          {tag}
                        </Badge>
                      ))}
                    </HStack>
                    <IconButton
                      aria-label='Remove skill'
                      icon={<CloseIcon boxSize={3} />}
                      size='xs'
                      colorScheme='red'
                      variant='ghost'
                      position='absolute'
                      bottom='8px'
                      right='8px'
                      onClick={() => deleteSkillMutation.mutate(skill._id || skill.id)}
                      isLoading={deleteSkillMutation.isPending}
                    />
                  </CardBody>
                </Card>
              ))}
            </Stack>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
}
