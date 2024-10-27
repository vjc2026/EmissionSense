import { useState, useEffect } from 'react';
import { Title, Text, TextInput, Button, Container, Group, Anchor, Center, Box, rem, Select } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import classes from './Proceed.module.css';

const DeviceForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [device, setDevice] = useState<string | null>(null);
  const [cpu, setCpu] = useState('');
  const [gpu, setGpu] = useState('');
  const [ram, setRam] = useState('');
  const [motherboard, setMotherboard] = useState('');
  const [psu, setPsu] = useState('');
  
  const [cpuOptions, setCpuOptions] = useState<string[]>([]);
  const [gpuOptions, setGpuOptions] = useState<string[]>([]);
  
  const { name, email, password, organization } = location.state || {};
  
  // Fetch CPU and GPU options on component mount
  useEffect(() => {
    const fetchCpuOptions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/cpu-options');
        setCpuOptions(response.data.cpuOptions);
      } catch (error) {
        console.error('Error fetching CPU options:', error);
      }
    };
    
    const fetchGpuOptions = async () => {
      try {
        const response = await axios.get('http://localhost:5000/gpu-options');
        setGpuOptions(response.data.gpuOptions);
      } catch (error) {
        console.error('Error fetching GPU options:', error);
      }
    };
    
    fetchCpuOptions();
    fetchGpuOptions();
  }, []);
  
  const handleLogin = () => {
    navigate('/register');
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/register', {
        name,
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
        <Title ta="center" className={classes.heading} style={{ background: 'transparent' }}>
          {device ? `Device: ${device}` : 'Select your Device'}
        </Title>
        <Text c="dimmed" fz="sm" ta="center" style={{ color: 'white' }}>
          {device ? 'Enter your information below' : 'Choose a device type to continue'}
        </Text>

        <div className={classes.formContainer}>
          {!device ? (
            <Group ta="center" mt="md">
              <Button fullWidth size="md" onClick={() => setDevice('Personal Computer')} className={classes.button} color="green">
                Personal Computer
              </Button>
              <Button fullWidth size="md" onClick={() => setDevice('Laptop')} className={classes.button} color="green">
                Laptop
              </Button>
              <Anchor c="dimmed" size="sm" className={classes.control}>
                <Center inline>
                  <IconArrowLeft style={{ width: rem(12), color: 'white', height: rem(12) }} stroke={1.5} />
                  <Box onClick={handleLogin} ml={5} style={{ color: 'white' }}>
                    Go Back
                  </Box>
                </Center>
              </Anchor>
            </Group>
          ) : (
            <>
              <Select
                label="CPU"
                placeholder="Select your CPU"
                value={cpu}
                onChange={(value) => setCpu(value || '')}
                data={cpuOptions.map((option) => ({ value: option, label: option }))} // Correctly formatted options
                required
                mb="sm"
                className={classes.inputField}
              />
              <Select
                label="GPU"
                placeholder="Select your GPU"
                value={gpu}
                onChange={(value) => setGpu(value || '')}
                data={gpuOptions.map((option) => ({ value: option, label: option }))} // Correctly formatted options
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
                mb="sm"
                className={classes.inputField}
              />
              <Button fullWidth mt="sm" onClick={handleSubmit} className={classes.button} color="green">
                Submit
              </Button>
            </>
          )}
        </div>
      </Container>
    </div>
  );
};

export default DeviceForm;
