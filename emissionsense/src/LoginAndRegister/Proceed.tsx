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
  
  const [cpuOptions, setCpuOptions] = useState<{ label: string; value: string }[]>([]);
  const [gpuOptions, setGpuOptions] = useState<{ label: string; value: string }[]>([]);
  
  const { name, email, password, organization } = location.state || {};

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const cpuResponse = await axios.get('http://localhost:5000/cpu-options');
        setCpuOptions(
          cpuResponse.data.cpuOptions.map((cpu: { label: string; value: string }) => ({
            label: cpu.label, // Display full option as label
            value: cpu.value  // Use model as the unique value
          }))
        );

        const gpuResponse = await axios.get('http://localhost:5000/gpu-options');
        setGpuOptions(
          gpuResponse.data.gpuOptions.map((gpu: { label: string; value: string }) => ({
            label: gpu.label, // Display full option as label
            value: gpu.value  // Use model as the unique value
          }))
        );
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
    
    fetchOptions();
  }, []);

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
                  <Box onClick={() => navigate('/register')} ml={5} style={{ color: 'white' }}>
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
                data={cpuOptions} // Display optionString, save model
                required
                mb="sm"
                className={classes.inputField}
              />
              <Select
                label="GPU"
                placeholder="Select your GPU"
                value={gpu}
                onChange={(value) => setGpu(value || '')}
                data={gpuOptions} // Display optionString, save model
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