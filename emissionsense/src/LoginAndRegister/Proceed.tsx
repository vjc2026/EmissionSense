import { useState } from 'react';
import { Paper, Title, Text, TextInput, Button, Container, Group, Anchor, Center, Box, rem } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const DeviceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To receive the data passed from Register.tsx

  // States to store the computer component details
  const [device, setDevice] = useState<string | null>(null);
  const [cpu, setCpu] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState('');
  const [motherboard, setMotherboard] = useState('');
  const [psu, setPsu] = useState('');

  // Extracting user details passed from Register.tsx
  const { email, password, organization } = location.state || {};

  // Function to handle form submission to save data to the database
  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        email,
        password,
        organization,
        device,
        cpu,
        gpu,
        ram,
        motherboard,
        psu
      });
      if (response.status === 200) {
        // Navigate to the main content after successful registration
        navigate('/main');
      } else {
        console.error('Error saving user data');
      }
    } catch (error) {
      console.error('Error during submission:', error);
    }
  };

  return (
    <Container size={480} my={30}>
      <Title ta="center">
        {device ? `Device: ${device}` : 'Select your Device'}
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        {device ? 'Enter your information below' : 'Choose a device type to continue'}
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        {!device ? (
          <Group ta="center" mt="md">
            <Button 
              fullWidth 
              size="md" 
              onClick={() => setDevice('Personal Computer')}
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.blue[6],
                  ':hover': {
                    backgroundColor: theme.colors.blue[7],
                  },
                },
              })}
            >
              Personal Computer
            </Button>
            <Button 
              fullWidth 
              size="md" 
              onClick={() => setDevice('Laptop')}
              styles={(theme) => ({
                root: {
                  backgroundColor: theme.colors.blue[6],
                  ':hover': {
                    backgroundColor: theme.colors.blue[7],
                  },
                },
              })}
            >
              Laptop
            </Button>
          </Group>
        ) : (
          <>
            <TextInput
              label="CPU"
              placeholder="Enter your CPU"
              value={cpu}
              onChange={(e) => setCpu(e.currentTarget.value)}
              required
              mb="sm"
            />
            <TextInput
              label="GPU"
              placeholder="Enter your GPU"
              value={gpu}
              onChange={(e) => setGpu(e.currentTarget.value)}
              required
              mb="sm"
            />
            <TextInput
              label="RAM"
              placeholder="Enter your RAM"
              value={ram}
              onChange={(e) => setRam(e.currentTarget.value)}
              required
              mb="sm"
            />
            <TextInput
              label="Motherboard"
              placeholder="Motherboard"
              value={motherboard}
              onChange={(e) => setMotherboard(e.currentTarget.value)}
              required
              mb="sm"
            />
            <TextInput
              label="PSU"
              placeholder="PSU"
              value={psu}
              onChange={(e) => setPsu(e.currentTarget.value)}
              required
              mb="md"
            />
            <Group justify="space-between" mt="lg">
              <Anchor size="sm" c="dimmed">
                <Center inline>
                  <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                  <Box onClick={() => setDevice(null)} ml={5}>Back to device selection</Box>
                </Center>
              </Anchor>
              <Button
                onClick={handleSubmit}
                styles={(theme) => ({
                  root: {
                    backgroundColor: theme.colors.blue[6],
                    ':hover': {
                      backgroundColor: theme.colors.blue[7],
                    },
                  },
                })}
              >
                Submit
              </Button>
            </Group>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default DeviceForm;
