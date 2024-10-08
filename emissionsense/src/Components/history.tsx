import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  TextInput, 
  Button, 
  Group, 
  Notification, 
  List, 
  Card, 
  Loader, 
  Divider, 
  Stack 
} from '@mantine/core';

export function HistoryComponent() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [projects, setProjects] = useState<any[]>([]); // Array to store user projects
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
        const response = await fetch('http://localhost:5000/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, 
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); 
          fetchUserProjects(data.user.email); // Fetch user's projects
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

  const fetchUserProjects = async (email: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/user_projects?email=${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects); // Set the fetched projects
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to fetch user projects.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while fetching user projects.');
    }
  };

  const startSession = () => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    const id = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000); 
    setIntervalId(id);
  };

  const endSession = async () => {
    if (!isTimerRunning) return; 
    clearInterval(intervalId!); 
    setIsTimerRunning(false);

    const token = localStorage.getItem('token');
    const historyData = {
      projectName,
      projectDescription,
      sessionDuration,
    };

    try {
      const response = await fetch('http://localhost:5000/user_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(historyData),
      });

      if (response.ok) {
        setProjectName('');
        setProjectDescription('');
        setSessionDuration(0);
        fetchUserProjects(user?.email!); // Refresh the project list
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to record session.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while recording the session.');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/delete_project/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchUserProjects(user?.email!); // Refresh the project list
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete project.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while deleting the project.');
    }
  };

  const handleEditProject = (projectId: number) => {
    const projectToEdit = projects.find(project => project.id === projectId);
    if (projectToEdit) {
      setProjectName(projectToEdit.project_name);
      setProjectDescription(projectToEdit.project_description);
      // You may want to implement additional logic to edit this project 
      // (e.g., update the project ID in state for a later PUT request)
    }
  };

  return (
    <Container>
      {loading && <Loader />}
      {error && <Notification color="red" title="Error">{error}</Notification>}
      {user && !loading ? (
        <Stack>
          <Text size="xl" fw={500}>Welcome, {user.name}!</Text>
          <TextInput
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.currentTarget.value)}
            required
          />
          <TextInput
            label="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.currentTarget.value)}
            required
          />
          <Group mt="md">
            <Button onClick={startSession} disabled={isTimerRunning} color="green">Start Session</Button>
            <Button onClick={endSession} disabled={!isTimerRunning} color="blue">End Session</Button>
          </Group>
          <Text mt="md" size="lg">Session Duration: {sessionDuration} seconds</Text>
          <Divider my="md" />
          <Text size="lg" fw={500}>Your Projects:</Text>
          <List spacing="md">
            {projects.map(project => (
              <List.Item key={project.id}>
                <Card shadow="sm" padding="lg" radius="md">
                  <Text size="md" fw={500}>{project.project_name}</Text>
                  <Text size="sm" color="dimmed">{project.project_description}</Text>
                  <Group align="apart" mt="md">
                    <Button onClick={() => handleEditProject(project.id)} variant="outline">Edit</Button>
                    <Button color="red" onClick={() => handleDeleteProject(project.id)}>Delete</Button>
                  </Group>
                </Card>
              </List.Item>
            ))}
          </List>
        </Stack>
      ) : (
        <Text>Loading...</Text>
      )}
    </Container>
  );
}

export default HistoryComponent;
