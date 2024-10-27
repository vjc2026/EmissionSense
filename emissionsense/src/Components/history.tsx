import { useState, useEffect } from 'react';
import { 
  Container, 
  Text, 
  TextInput, 
  Button, 
  Group, 
  Card, 
  Loader, 
  Divider, 
  Stack, 
  Title, 
  Modal 
} from '@mantine/core';
import styles from './History.module.css';

export function HistoryComponent() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [projects, setProjects] = useState<any[]>([]); 
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  
  // Modal-related state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editableProject, setEditableProject] = useState<any | null>(null);

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

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
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); 
          fetchUserProjects(data.user.email); 
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
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects); 
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to fetch user projects.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while fetching user projects.');
    }
  };

  const startSession = async () => {
    if (isTimerRunning) return;
    
    const token = localStorage.getItem('token');
    console.log("Starting session with:", projectName, projectDescription);
 
    try {
       // Check for existing project
       const response = await fetch(`http://localhost:5000/find_project`, {
          method: 'POST',
          headers: {
             'Content-Type': 'application/json',
             'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ projectName, projectDescription }),
       });
 
       if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.statusText}`);
       }
 
       const existingProject = await response.json();
       console.log("Existing project found:", existingProject);
 
       // Set session duration based on existing project
       if (existingProject) {
          setSessionDuration(existingProject.session_duration || 0);
       } else {
          setSessionDuration(0);
       }
 
       // Start the timer
       setIsTimerRunning(true);
       const id = setInterval(() => {
          setSessionDuration((prev) => prev + 1);
       }, 1000);
       setIntervalId(id);
    } catch (err) {
       console.error('Error in startSession:', err);
       setError('An error occurred while starting the session.');
    }
 };
 

 const endSession = async () => {
  if (!isTimerRunning) return;
  clearInterval(intervalId!);
  setIsTimerRunning(false);

  const token = localStorage.getItem('token');
  const historyData = { projectName, projectDescription, sessionDuration }; // The project being updated

  try {
    const response = await fetch('http://localhost:5000/find_project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ projectName, projectDescription }),
    });
  
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }
  
    const existingProject = await response.json();
    console.log("Existing project found:", existingProject);
  
    // Check if an existing project was found
    if (existingProject) {
      try {
        const response = await fetch('http://localhost:5000/user_Update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(historyData),
        });
  
        if (response.ok) {
          // Reset fields and refresh project list after update
          setProjectName('');
          setProjectDescription('');
          setSessionDuration(0);
          fetchUserProjects(user?.email!); // Ensure user is defined before calling
  
          setSessionHistory(prev => [
            ...prev.filter(session => session.projectName !== historyData.projectName),
            { projectName: historyData.projectName, projectDescription: historyData.projectDescription, sessionDuration: historyData.sessionDuration },
          ]);
        } 
        else {
          const result = await response.json();
          setError(result.error || 'Failed to record session.');
        }
      } 
      catch (err) {
        console.error('Error:', err);
        setError('An error occurred while recording the session.');
      }
    } 
    else {
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
          fetchUserProjects(user?.email!); 
  
          setSessionHistory(prev => [
            ...prev,
            { projectName: historyData.projectName, projectDescription: historyData.projectDescription, sessionDuration: historyData.sessionDuration },
          ]);
        } else {
          const result = await response.json();
          setError(result.error || 'Failed to record session.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while recording the session.');
      }
    };
    
    }
    catch (err) {
      console.error('Error in finding project:', err);
      setError('An error occurred while fetching the project.');
    }
  } 
  
  // Open modal and set the project to edit
  const handleEditProject = (projectId: number) => {
    const projectToEdit = projects.find(project => project.id === projectId);
    if (projectToEdit) {
      setEditableProject(projectToEdit);
      setProjectName(projectToEdit.project_name);
      setProjectDescription(projectToEdit.project_description);
      setIsModalOpen(true); // Open the modal
    }
  };

  // Save changes from modal
  const handleSaveChanges = async () => {
    if (!editableProject) return;

    const token = localStorage.getItem('token');
    const updatedProject = { projectName, projectDescription };

    try {
      const response = await fetch(`http://localhost:5000/update_project/${editableProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProject),
      });

      if (response.ok) {
        fetchUserProjects(user?.email!); 
        setIsModalOpen(false); // Close the modal
        setEditableProject(null); // Reset editable project
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to update project.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while updating the project.');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:5000/delete_project/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchUserProjects(user?.email!); 
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete project.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred while deleting the project.');
    }
  };

  return (
    <Container className={styles.container}>
      <Title order={2} className={styles.title}>Project Session Tracker</Title>
      <Stack mt="md">
        <TextInput
          placeholder="Enter project name"
          label="Project Name"
          onChange={(event) => setProjectName(event.currentTarget.value)}
          className={styles.inputField}
          disabled={isModalOpen} // Disable when modal is open
        />
        <TextInput
          placeholder="Enter project description"
          label="Project Description"
          onChange={(event) => setProjectDescription(event.currentTarget.value)}
          className={styles.inputField}
          disabled={isModalOpen} // Disable when modal is open
        />
        <Group className={styles.buttonGroup}>
          <Button 
            onClick={startSession} 
            disabled={isTimerRunning || isModalOpen || !projectName || !projectDescription} // Disable if either input is empty
            fullWidth 
            color='green'
          >
            Start Session
          </Button>
          <Button 
            onClick={endSession} 
            disabled={!isTimerRunning || isModalOpen} 
            color="red" 
            fullWidth
          >
            End Session
          </Button>
        </Group>

        {isTimerRunning && (
          <Card className={styles.sessionCard}>
            <Text className={styles.sessionText}>
              Session in Progress: {formatDuration(sessionDuration)}
            </Text>
          </Card>
        )}

        <Divider my="md" />

        <Title order={3} className={styles.historyTitle}>Project History</Title>
        {projects.map((project) => (
          <Card key={project.id} className={styles.projectCard}>
            <Text>{project.project_name}</Text>
            <Text>{project.project_description}</Text>
            <Text>Session Duration: {formatDuration(project.session_duration)}</Text>
            <Group align="right">
              <Button size="xs" onClick={() => handleEditProject(project.id)}>
                Edit
              </Button>
              <Button size="xs" color="red" onClick={() => handleDeleteProject(project.id)}>
                Delete
              </Button>
            </Group>
          </Card>
        ))}

        {/* Edit Project Modal */}
        <Modal
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Project"
        >
          <Stack>
            <TextInput
              label="Project Name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(event) => setProjectName(event.currentTarget.value)}
            />
            <TextInput
              label="Project Description"
              placeholder="Enter project description"
              value={projectDescription}
              onChange={(event) => setProjectDescription(event.currentTarget.value)}
            />
            <Group align="right">
              <Button onClick={handleSaveChanges}>Save</Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}

export default HistoryComponent;
