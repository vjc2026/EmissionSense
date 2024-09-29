import {
  Title,
  Text,
  TextInput,
  Button,
  Container,
  Group,
  Anchor,
  Center,
  Box,
  rem,
  PasswordInput
} from '@mantine/core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Register.module.css';
import { IconArrowLeft } from '@tabler/icons-react';
import { GoogleButton } from './GoogleButton';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const navigate = useNavigate();

  // Corrected handleLogin function to navigate to the login page
  const handleLogin = () => {
    navigate('/'); // Change this to your actual login route
  };

  const handleProceed = () => {
    if (!email || !password || !organization || password !== confirmPassword) {
      alert('Please fill all fields and ensure the passwords match.');
      return;
    }

    navigate('/proceed', {
      state: {
        email,
        password,
        organization,
      },
    });
  };

  return (
    <div className={classes.container}>
      <Container size={460} my={30} className={classes.formContainer}>
        <Title className={classes.title} ta="center" style={{ textShadow: '1px 1px 10px rgba(0, 0, 0, 0.6)' }}>
          Create your Account.
        </Title>
        <Text c="white" fz="sm" ta="center" style={{ textShadow: '1px 1px 10px rgba(0, 0, 0, 0.6)' }}>
          Enter your information.
        </Text>

        <div className={classes.formContent}>
          <TextInput
            label="Your email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
            style={{ color: 'white' }}
          />
          <PasswordInput
            label="Password"
            className={classes.text}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
            style={{ color: 'white' }}
          />
          <PasswordInput
            label="Confirm Password"
            className={classes.text}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            required
            style={{ color: 'white' }}
          />
          <TextInput
            label="Organization"
            className={classes.text}
            placeholder="Enter your organization"
            value={organization}
            onChange={(e) => setOrganization(e.currentTarget.value)}
            required
            style={{ color: 'white' }}
          />
          <Group justify="space-between" className={classes.controls}>
            <Anchor c="dimmed" size="sm" className={classes.control}>
              <Center inline>
                <IconArrowLeft style={{ width: rem(12), color: 'white', height: rem(12) }} stroke={1.5} />
                <Box onClick={handleLogin} ml={5} style={{ color: 'white' }}>
                  Back to the login page
                </Box>
              </Center>
            </Anchor>
            <Button onClick={handleProceed} color="green" fullWidth mt="xl" className={classes.control}>
              Proceed
            </Button>
            <GoogleButton fullWidth mt="xl">
              Sign in with Google
            </GoogleButton>
          </Group>
        </div>
      </Container>
    </div>
  );
};

export default RegisterPage;
