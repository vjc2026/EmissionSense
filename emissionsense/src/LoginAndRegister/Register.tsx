import { Title, Text, TextInput, Button, Container, Group, Anchor, Center, Box, rem, PasswordInput } from '@mantine/core';
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

  const handleLogin = () => {
    navigate('/');
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
      <Container size={460} my={30}>
        <Title className={classes.title} ta="center">
          Create your Account.
        </Title>
        <Text c="white" fz="sm" ta="center">
          Enter your information.
        </Text>

        <div className={classes.formContainer}>
          <TextInput
            label="Your email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Password"
            className={classes.text}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Confirm Password"
            className={classes.text}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Organization"
            className={classes.text}
            placeholder="Enter your organization"
            value={organization}
            onChange={(e) => setOrganization(e.currentTarget.value)}
            required
          />
          <Group justify="space-between" className={classes.controls}>
            <Anchor c="dimmed" size="sm" className={classes.control}>
              <Center inline>
                <IconArrowLeft style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                <Box onClick={handleLogin} ml={5}>
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
