import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  Avatar,
  Card,
  Loader, 
  Stack, 
  Title,
} from '@mantine/core';
import styles from './History.module.css';

export function ProfileComponent() {
  const [user, setUser] = useState<{ 
    name: string; 
    email: string;
    organization: string;
    profile_image: string | null;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token'); 

      if (!token) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      try {
        // Fetch user details
        const response = await fetch('http://localhost:5000/user', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          
          // If there's a user ID, fetch the profile image
          if (data.user.id) {
            const imageResponse = await fetch(`http://localhost:5000/profile-image/${data.user.id}`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });

            if (imageResponse.ok) {
              const imageBlob = await imageResponse.blob();
              const imageUrl = URL.createObjectURL(imageBlob);
              setUser(prevUser => ({
                ...prevUser!,
                profile_image: imageUrl
              }));
            }
          }
        } else {
          const result = await response.json();
          setError(result.error || 'Failed to fetch user details.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while fetching user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <Container className={styles.container}>
      <Title order={1} className={styles.title}>
        User Profile
      </Title>

      {error && (
        <Text className={styles.errorText}>
          {error}
        </Text>
      )}

      {loading ? (
        <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
      ) : user ? (
        <Stack mt="md">
          <Card className={styles.profileCard}>
            <Avatar
              src={user.profile_image}
              size={150}
              radius="xl"
              mx="auto"
              mb="md"
            />
            <Text ta="center" size="xl" fw={700} mb="xs">
              {user.name}
            </Text>
            <Text ta="center" size="md" color="dimmed">
              {user.email}
            </Text>
            <Text ta="center" size="md">
              Organization: {user.organization}
            </Text>
          </Card>
        </Stack>
      ) : (
        <Text>No user data available</Text>
      )}
    </Container>
  );
}

export default ProfileComponent;
