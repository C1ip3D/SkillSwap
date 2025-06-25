import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Input,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { skills } from '../lib/api.js';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPaperPlane,
} from 'react-icons/fa';
import { io } from 'socket.io-client';

export default function SkillExchange() {
  const { skillId } = useParams();
  const toast = useToast();
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  const { data: skill, isLoading } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => skills.get(skillId),
  });

  useEffect(() => {
    // Initialize WebRTC
    const initializeWebRTC = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize peer connection
        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        // Add local stream to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });

        // Handle incoming stream
        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast({
          title: 'Error',
          description: 'Failed to access camera and microphone',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    // Initialize Socket.io connection
    const socket = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      query: { skillId },
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(socket);
    initializeWebRTC();

    return () => {
      socket.disconnect();
      peerConnection.current?.close();
    };
  }, [skillId, toast]);

  const toggleAudio = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject;
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const sendMessage = () => {
    if (message.trim() && socket) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'You',
        content: message,
        timestamp: new Date(),
      };
      socket.emit('message', newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setMessage('');
    }
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
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
        <GridItem>
          <VStack spacing={4} align='stretch'>
            <Box position='relative' borderRadius='lg' overflow='hidden'>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  backgroundColor: '#000',
                }}
              />
              <Box
                position='absolute'
                bottom={4}
                right={4}
                width='200px'
                height='150px'
                borderRadius='md'
                overflow='hidden'
                border='2px solid'
                borderColor='white'
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            </Box>

            <HStack justify='center' spacing={4}>
              <IconButton
                aria-label={isAudioEnabled ? 'Mute' : 'Unmute'}
                icon={isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                onClick={toggleAudio}
                colorScheme={isAudioEnabled ? 'brand' : 'gray'}
              />
              <IconButton
                aria-label={
                  isVideoEnabled ? 'Turn off camera' : 'Turn on camera'
                }
                icon={isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
                onClick={toggleVideo}
                colorScheme={isVideoEnabled ? 'brand' : 'gray'}
              />
            </HStack>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack spacing={4} align='stretch' height='100%'>
            <Box
              flex={1}
              borderWidth={1}
              borderRadius='lg'
              p={4}
              overflowY='auto'
              maxHeight='calc(100vh - 300px)'
            >
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  bg={msg.sender === 'You' ? 'brand.50' : 'gray.50'}
                  p={3}
                  borderRadius='md'
                  mb={2}
                >
                  <Text fontWeight='bold'>{msg.sender}</Text>
                  <Text>{msg.content}</Text>
                  <Text fontSize='xs' color='gray.500'>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </Text>
                </Box>
              ))}
            </Box>

            <Flex>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Type a message...'
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <IconButton
                aria-label='Send message'
                icon={<FaPaperPlane />}
                onClick={sendMessage}
                ml={2}
                colorScheme='brand'
              />
            </Flex>
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
}
