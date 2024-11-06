import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  Loader, 
  Title, 
  Stack 
} from '@mantine/core';
import styles from './TEST.module.css';

export function HELPComponent() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    organization: string;
    specifications: {
      GPU: string;
      CPU: string;
      motherboard: string;
      PSU: string;
      RAM: string;
      CPU_avg_watt_usage: number | null;
      GPU_avg_watt_usage: number | null;
    };
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
        const response = await fetch('http://localhost:5000/displayuser', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Set the user details
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
        User Information
      </Title>
  
      {error && <Text className={styles.errorText}>{error}</Text>}
  
      {loading ? (
        <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
      ) : (
        <Stack mt="md">
          <Text><strong>Name:</strong> {user?.name}</Text>
          <Text><strong>Email:</strong> {user?.email}</Text>
          <Text><strong>Organization:</strong> {user?.organization}</Text>
          <Text><strong>GPU:</strong> {user?.specifications.GPU}</Text>
          <Text><strong>CPU:</strong> {user?.specifications.CPU}</Text>
          <Text><strong>Motherboard:</strong> {user?.specifications.motherboard}</Text>
          <Text><strong>PSU:</strong> {user?.specifications.PSU}</Text>
          <Text><strong>RAM:</strong> {user?.specifications.RAM}</Text>
          <Text><strong>CPU Average Watt Usage:</strong> {user?.specifications.CPU_avg_watt_usage ?? 'N/A'} W</Text>
          <Text><strong>GPU Average Watt Usage:</strong> {user?.specifications.GPU_avg_watt_usage ?? 'N/A'} W</Text>
        </Stack>
      )}
    </Container>
  );
}

export default HELPComponent;
