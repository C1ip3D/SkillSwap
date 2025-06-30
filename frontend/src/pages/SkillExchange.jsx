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
  Avatar,
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
  FaDesktop,
  FaStop,
  FaRecordVinyl,
  FaCircle,
} from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth.js';

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
  const [mediaError, setMediaError] = useState(null);
  const { user } = useAuth();
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [elapsed, setElapsed] = useState('00:00');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const { data: skill, isLoading } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: () => skills.get(skillId),
    refetchInterval: 5000,
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
        setMediaError(null);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setMediaError(error.message || 'Failed to access camera and microphone');
        toast({
          title: 'Error',
          description: error.message || 'Failed to access camera and microphone',
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
      return true;
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

  // Timer effect
  useEffect(() => {
    setSessionStart(Date.now());
    const interval = setInterval(() => {
      const diff = Date.now() - sessionStart;
      const minutes = Math.floor(diff / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setElapsed(`${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [skillId]);

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

  // Screen sharing logic
  const handleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // Revert to webcam
          initializeWebRTC();
        };
      } catch (err) {
        toast({ title: 'Error', description: 'Screen sharing failed', status: 'error' });
      }
    } else {
      setIsScreenSharing(false);
      initializeWebRTC();
    }
  };

  // Recording logic
  const handleRecord = () => {
    if (!isRecording) {
      const stream = localVideoRef.current?.srcObject;
      if (stream) {
        recordedChunksRef.current = [];
        const recorder = new window.MediaRecorder(stream, { mimeType: 'video/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data);
        };
        recorder.onstart = () => {
          console.log('Recorder started');
        };
        recorder.onstop = () => {
          console.log('Recorder stopped');
          setIsRecording(false);
          mediaRecorderRef.current = null;
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'recording.webm';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        };
        recorder.onerror = (e) => {
          console.error('Recorder error', e);
          setIsRecording(false);
        };
        recorder.start();
        setIsRecording(true);
        // Fallback: stop recording after 10 minutes if not stopped
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.warn('Auto-stopping recorder after timeout');
            mediaRecorderRef.current.stop();
          }
        }, 10 * 60 * 1000);
      }
    } else if (mediaRecorderRef.current) {
      console.log('Stopping recorder...');
      mediaRecorderRef.current.stop();
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
                display='flex'
                alignItems='center'
                justifyContent='center'
                bg='black'
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: isVideoEnabled ? 'block' : 'none' }}
                />
                {!isVideoEnabled && (
                  <Avatar
                    size='lg'
                    name={user?.name}
                    src={user?.avatar}
                    showBorder
                    bg='gray.700'
                    color='white'
                    position='absolute'
                    top='50%'
                    left='50%'
                    transform='translate(-50%, -50%)'
                  />
                )}
              </Box>
              {mediaError && (
                <Box
                  position='absolute'
                  top={0}
                  left={0}
                  width='100%'
                  height='100%'
                  bg='rgba(0,0,0,0.7)'
                  color='white'
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
                  zIndex={2}
                  fontSize='lg'
                  fontWeight='bold'
                  textAlign='center'
                  p={4}
                >
                  {mediaError}
                </Box>
              )}
            </Box>

            {/* Session Info and Controls */}
            <Box
              w='100%'
              display='flex'
              flexDirection={{ base: 'column', md: 'row' }}
              alignItems={{ base: 'flex-start', md: 'center' }}
              justifyContent='space-between'
              px={2}
              py={2}
              bg='gray.50'
              borderRadius='md'
              boxShadow='sm'
              mb={2}
            >
              <HStack spacing={4} align='center'>
                <Avatar size='sm' name={user?.name} src={user?.avatar} />
                <Text fontWeight='bold'>{user?.name || 'You'}</Text>
              </HStack>
              <HStack spacing={2} align='center'>
                {isRecording && (
                  <Box as='span' display='flex' alignItems='center' mr={2}>
                    <FaCircle color='red' style={{ marginRight: 4 }} />
                    <Text color='red.500' fontWeight='bold' fontSize='sm'>Recording...</Text>
                  </Box>
                )}
                <IconButton
                  aria-label={isRecording ? 'Stop Recording' : 'Record'}
                  icon={isRecording ? <FaStop /> : <FaRecordVinyl />}
                  onClick={handleRecord}
                  colorScheme={isRecording ? 'red' : 'blue'}
                  variant={isRecording ? 'solid' : 'outline'}
                  size='sm'
                />
                <IconButton
                  aria-label={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                  icon={isScreenSharing ? <FaStop /> : <FaDesktop />}
                  onClick={handleScreenShare}
                  colorScheme={isScreenSharing ? 'red' : 'blue'}
                  variant='outline'
                  size='sm'
                />
                <Text color='gray.600' fontSize='sm'>Session Time: {elapsed}</Text>
              </HStack>
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
          <VStack
            spacing={4}
            align='stretch'
            height='678px'
          >
            <Box
              flex={1}
              borderWidth={1}
              borderRadius='lg'
              p={4}
              overflowY='auto'
              minHeight='400px'
              maxHeight='calc(100vh - 300px)'
              bg='white'
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
