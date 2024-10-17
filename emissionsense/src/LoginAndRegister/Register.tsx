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
  PasswordInput,
  FileInput,
  Avatar,
  Tooltip,
} from '@mantine/core';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Register.module.css';
import { IconArrowLeft } from '@tabler/icons-react';
import { GoogleButton } from './GoogleButton';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/');
  };

  const compressImage = (file: File, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (ctx) {
            // Resize the canvas to the dimensions of the image
            const maxWidth = 800; // Set maximum width
            const maxHeight = 800; // Set maximum height
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Compress the image to a Blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: file.type }));
              } else {
                resolve(file); // Fallback in case blob generation fails
              }
            }, file.type, quality);
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProfilePictureChange = async (file: File | null) => {
    if (file) {
      const compressedFile = await compressImage(file, 0.8); // Compress to 80% quality
      setProfilePicture(compressedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } else {
      setProfilePicturePreview(null);
    }
  };

  const handleProceed = () => {
    if (!name || !email || !password || !organization || password !== confirmPassword) {
      alert('Please fill all fields and ensure the passwords match.');
      return;
    }

    navigate('/proceed', {
      state: {
        name,
        email,
        password,
        organization,
        profilePicture,
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
          <Text c="white" fz="sm" ta="center" style={{ marginBottom: '0.5rem' }}>
            Customize Profile Picture (optional)
          </Text>
          <Center>
            <Tooltip label="Input Profile Picture" withArrow position="top">
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('file-input')?.click()}>
                <Avatar
                  size={120}
                  radius={120}
                  src={profilePicturePreview}
                  alt="Profile Picture"
                  style={{ border: '2px solid white' }}
                />
                <FileInput
                  id="file-input" // Give the input an ID
                  label="Profile Picture"
                  placeholder="Upload your profile picture"
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  className={classes.text}
                  style={{ display: 'none' }} // Hide the actual input
                />
              </div>
            </Tooltip>
          </Center>

          <TextInput
            label="Name"
            className={classes.text}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            style={{ color: 'white' }}
          />
          <TextInput
            label="Your email"
            className={classes.text}
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
