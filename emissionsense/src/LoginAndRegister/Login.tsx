import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Title,
  Text,
  Anchor,
  Group,
  Container,
} from '@mantine/core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Login.module.css';
import { GoogleButton } from './GoogleButton';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // State for error message
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the token in localStorage
        localStorage.setItem('token', result.token);
        navigate('/main');
      } else {
        setError(result.error || 'Login failed'); // Set error message
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.'); // Set error message
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className={classes.container}>
      <div className={classes.left}>
        <Container size={420} my={40}>
          <Title ta="center" className={classes.title} style={{ color: 'white' }}>
            Welcome back!
          </Title>
          <Text c="dimmed" size="sm" ta="center" mt={5}>
            Do not have an account yet?{' '}
            <Anchor size="sm" component="button" style={{ color: 'green' }} onClick={handleRegister}>
              Create account
            </Anchor>
          </Text>

          <TextInput
            style={{ color: 'white' }}
            label="Email"
            placeholder="Enter your email"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <PasswordInput
            style={{ color: 'white' }}
            label="Password"
            placeholder="Enter your password"
            required
            mt="md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" style={{ color: 'white' }} />
            <Anchor component="button" style={{ color: 'green' }} size="sm">
              Forgot password?
            </Anchor>
          </Group>
          {error && <Text color="red" size="sm" ta="center" mt="md">{error}</Text>}
          <Button fullWidth mt="xl" color="green" onClick={handleLogin}>
            Sign in
          </Button>
          <GoogleButton fullWidth mt="xl">
            Sign in with Google
          </GoogleButton>
        </Container>
      </div>

      <div className={classes.right}></div>
    </div>
  );
};

export default LoginPage;
