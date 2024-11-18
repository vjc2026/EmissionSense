import {
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Anchor,
  Container,
} from '@mantine/core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './ForgotPassword.module.css';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword }), // Sends email and new password
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Password has been reset successfully. Please log in with your new password.');
        setError('');
      } else {
        setError(result.error || 'Reset password failed.');
        setMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
      setMessage('');
    }
  };

  const handleBackToLogin = () => {
    navigate('/');
  };

  return (
    <div className={classes.container}>
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title} style={{ color: 'white' }}>
          Forgot your password?
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Enter your email and new password to reset your account password.
        </Text>

        <TextInput
          label="Email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '1rem', color: 'white' }}
        />

        <TextInput
          label="New Password"
          placeholder="Enter your new password"
          required
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ marginBottom: '1rem', color: 'white' }}
        />

        {error && <Text color="red" size="sm" ta="center">{error}</Text>}
        {message && <Text color="green" size="sm" ta="center">{message}</Text>}

        <Button fullWidth mt="md" color="green" onClick={handleResetPassword}>
          Reset Password
        </Button>

        <Anchor
          size="sm"
          component="button"
          style={{ color: 'green' }}
          onClick={handleBackToLogin}
          mt="md"
        >
          Back to login
        </Anchor>
      </Container>
    </div>
  );
};

export default ForgotPasswordPage;
