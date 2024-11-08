import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Image, 
  Grid, 
  Loader, 
  Stack 
} from '@mantine/core';
import styles from './Button.module.css';

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

  const [deviceType, setDeviceType] = useState<string | null>(null); // State for device type
  const [projects, setProjects] = useState<any[]>([]);
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
        // Fetch device type to determine endpoint
        const response = await fetch('http://localhost:5000/checkDeviceType', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const { deviceType } = await response.json();
        setDeviceType(deviceType); // Set device type state

        const endpoint = deviceType === 'Laptop' 
          ? 'http://localhost:5000/displayuserM' 
          : 'http://localhost:5000/displayuser';

        const userResponse = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const data = await userResponse.json();
          setUser(data.user); // Set the user details
          fetchUserProjects(data.user.email); // Fetch user projects using email
        } else {
          const result = await userResponse.json();
          setError(result.error || 'Failed to fetch user details.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while fetching user details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserProjects = async (email: string) => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/user_projects?email=${email}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects); // Set the projects
        } else {
          const result = await response.json();
          setError(result.error || 'Failed to fetch user projects.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while fetching user projects.');
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <Container size="lg" className={styles.container}>
      <Grid gutter="md">
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg" className={styles.profileCard}>
            <Image
              src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
              alt="Profile Image"
              radius="xl"
              width={100}
              height={100}
              className={styles.profileImage}
            />
            <Text className={styles.profileName}>{user?.name || 'N/A'}</Text>
            <Text className={styles.profileRole}>{user?.organization || 'N/A'}</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={8}>
          <Card shadow="sm" padding="lg" className={styles.infoCard}>
            {error && <Text color="red">{error}</Text>}
            {loading ? (
              <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
            ) : (
              <Stack>
                <Title order={4} className={styles.sectionTitle}>Full Name</Title>
                <Text className={styles.infoText}>{user?.name || 'N/A'}</Text>

                <Title order={4} className={styles.sectionTitle}>Email</Title>
                <Text className={styles.infoText}>{user?.email || 'N/A'}</Text>

                <Title order={4} className={styles.sectionTitle}>Organization</Title>
                <Text className={styles.infoText}>{user?.organization || 'N/A'}</Text>

                <Title order={4} className={styles.sectionTitle}>User Device Specifications</Title>
                <Text className={styles.infoText}><strong>Device Using:</strong> {deviceType || 'N/A'}</Text>
                <Text className={styles.infoText}><strong>GPU:</strong> {user?.specifications.GPU || 'N/A'}</Text>
                <Text className={styles.infoText}><strong>GPU Average Watt Usage:</strong> {user?.specifications.GPU_avg_watt_usage ?? 'N/A'} W</Text>
                <Text className={styles.infoText}><strong>CPU:</strong> {user?.specifications.CPU || 'N/A'}</Text>
                <Text className={styles.infoText}><strong>CPU Average Watt Usage:</strong> {user?.specifications.CPU_avg_watt_usage ?? 'N/A'} W</Text>
                <Text className={styles.infoText}><strong>Motherboard:</strong> {user?.specifications.motherboard || 'N/A'}</Text>
                <Text className={styles.infoText}><strong>RAM:</strong> {user?.specifications.RAM || 'N/A'}</Text>
                <Text className={styles.infoText}><strong>PSU:</strong> {user?.specifications.PSU || 'N/A'}</Text>
              </Stack>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Title order={3} className={styles.sectionTitle}>Your Projects</Title>
      <Grid gutter="md">
        {projects.length === 0 ? (
          <Text>No projects found.</Text>
        ) : (
          projects.map(project => (
            <Grid.Col span={4} key={project.id}>
              <Card shadow="sm" padding="lg" className={styles.projectCard}>
                <Text fw={500}>{project.project_name}</Text>
                <Text size="sm">{project.project_description}</Text>
              </Card>
            </Grid.Col>
          ))
        )}
      </Grid>
    </Container>
  );
}

export default HELPComponent;
