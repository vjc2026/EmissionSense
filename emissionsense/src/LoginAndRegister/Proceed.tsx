import { useState } from 'react';
import { Title, Text, TextInput, Button, Container, Group, Anchor, Center, Box, rem } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import classes from './Proceed.module.css'; // Assuming this is where your styles reside

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

  // Function to fetch device specifications
  const fetchDeviceSpecifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/device-specs'); // Make sure this endpoint exists
      const { cpu, gpu, ram, motherboard, psu } = response.data;

      // Update states with fetched data
      setCpu(cpu);
      setGpu(gpu);
      setRam(ram);
      setMotherboard(motherboard);
      setPsu(psu);
    } catch (error) {
      console.error('Error fetching device specifications:', error);
    }
  };

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
    <div className={classes.container}>
      <Container size={480} my={30}>
        <Title ta="center" className={classes.heading} style={{ backround: 'transparent' }}>
          {device ? `Device: ${device}` : 'Select your Device'}
        </Title>
        <Text c="dimmed" fz="sm" ta="center">
          {device ? 'Enter your information below' : 'Choose a device type to continue'}
        </Text>

        <div className={classes.formContainer}>
          {!device ? (
            <Group ta="center" mt="md">
              <Button
                fullWidth
                size="md"
                onClick={() => setDevice('Personal Computer')}
                className={classes.button}
                color="green"
              >
                Personal Computer
              </Button>
              <Button
                fullWidth
                size="md"
                onClick={() => setDevice('Laptop')}
                className={classes.button}
                color="green"
              >
                Laptop
              </Button>
            </Group>
          ) : (
            <>
              <Button
                fullWidth
                size="md"
                onClick={fetchDeviceSpecifications}
                className={classes.button}
                mb="sm"
                color="green"
              >
                Auto-Fetch Device Specs
              </Button>
              <TextInput
                label="CPU"
                placeholder="Enter your CPU"
                value={cpu}
                onChange={(e) => setCpu(e.currentTarget.value)}
                required
                mb="sm"
                className={classes.inputField}
              />
              <TextInput
                label="GPU"
                placeholder="Enter your GPU"
                value={gpu}
                onChange={(e) => setGpu(e.currentTarget.value)}
                required
                mb="sm"
                className={classes.inputField}
              />
              <TextInput
                label="RAM"
                placeholder="Enter your RAM"
                value={ram}
                onChange={(e) => setRam(e.currentTarget.value)}
                required
                mb="sm"
                className={classes.inputField}
              />
              <TextInput
                label="Motherboard"
                placeholder="Motherboard"
                value={motherboard}
                onChange={(e) => setMotherboard(e.currentTarget.value)}
                required
                mb="sm"
                className={classes.inputField}
              />
              <TextInput
                label="PSU"
                placeholder="PSU"
                value={psu}
                onChange={(e) => setPsu(e.currentTarget.value)}
                required
                mb="md"
                className={classes.inputField}
              />
              <Group justify="space-between" mt="lg">
                <Anchor size="sm" c="dimmed">
                  <Center inline>
                    <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                    <Box onClick={() => setDevice(null)} ml={5}>
                      Back to device selection
                    </Box>
                  </Center>
                </Anchor>
                <Button
                  onClick={handleSubmit}
                  className={classes.button}
                  color="green"
                >
                  Submit
                </Button>
              </Group>
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default DeviceForm;
