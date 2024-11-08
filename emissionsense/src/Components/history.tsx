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
  Modal,
  Select
} from '@mantine/core';
import styles from './History.module.css';

export function HistoryComponent() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [organization, setOrganization] = useState<string | null>(null); // Add this line
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
          setOrganization(data.user.organization); // Set the organization here
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
 
       if (existingProject) {
          setSessionDuration(existingProject.session_duration || 0);
       } else {
          setSessionDuration(0);
       }
 
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
    const historyData = { 
        projectName, 
        projectDescription, 
        sessionDuration, 
        organization 
    };

    try {
        // Fetch the device type (Laptop or Personal Computer)
        const deviceTypeResponse = await fetch('http://localhost:5000/checkDeviceType', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!deviceTypeResponse.ok) {
            throw new Error(`Failed to fetch device type: ${deviceTypeResponse.statusText}`);
        }

        const { deviceType } = await deviceTypeResponse.json();

        // Choose the emissions calculation endpoint based on the device type
        const emissionsEndpoint = deviceType === 'Laptop' 
            ? 'http://localhost:5000/calculate_emissionsM'
            : 'http://localhost:5000/calculate_emissions';

        // Fetch carbon emissions
        const emissionsResponse = await fetch(emissionsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ sessionDuration }), 
        });

        if (!emissionsResponse.ok) {
            throw new Error(`Failed to calculate emissions: ${emissionsResponse.statusText}`);
        }

        const { carbonEmissions } = await emissionsResponse.json();
        console.log(`Calculated Carbon Emissions: ${carbonEmissions} kg CO2`);

        // Fetch or create project history
        const projectResponse = await fetch('http://localhost:5000/find_project', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ projectName, projectDescription }),
        });

        if (!projectResponse.ok) {
            throw new Error(`Failed to fetch project: ${projectResponse.statusText}`);
        }

        const existingProject = await projectResponse.json();
        console.log("Existing project found:", existingProject);

        if (existingProject) {
            // Update existing project
            const updateResponse = await fetch('http://localhost:5000/user_Update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...historyData, carbonEmissions }),
            });

            if (updateResponse.ok) {
                setProjectName('');
                setProjectDescription('');
                setSessionDuration(0);
                fetchUserProjects(user?.email!); 

                setSessionHistory(prev => [
                    ...prev.filter(session => session.projectName !== historyData.projectName),
                    { projectName: historyData.projectName, projectDescription: historyData.projectDescription, sessionDuration: historyData.sessionDuration, carbonEmissions, organization: historyData.organization },
                ]);
            } else {
                const result = await updateResponse.json();
                setError(result.error || 'Failed to record session.');
            }
        } else {
            // Create new project history
            const historyResponse = await fetch('http://localhost:5000/user_history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...historyData, carbonEmit: carbonEmissions }),
            });

            if (historyResponse.ok) {
                setProjectName('');
                setProjectDescription('');
                setSessionDuration(0);
                fetchUserProjects(user?.email!);

                setSessionHistory(prev => [
                    ...prev,
                    { projectName: historyData.projectName, projectDescription: historyData.projectDescription, sessionDuration: historyData.sessionDuration, carbonEmissions, organization: historyData.organization },
                ]);
            } else {
                const result = await historyResponse.json();
                setError(result.error || 'Failed to record session.');
            }
        }
    } catch (err) {
        console.error('Error in endSession:', err);
        setError('An error occurred while recording the session.');
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

  const handleEditProject = (projectId: number) => {
    const projectToEdit = projects.find(p => p.id === projectId);
    if (projectToEdit) {
      setProjectName(projectToEdit.project_name);
      setProjectDescription(projectToEdit.project_description);
      setEditableProject(projectToEdit);
      setIsModalOpen(true);
    }
  };


// Inside the HistoryComponent
return (
  <Container className={styles.container}>
    <Title order={1} className={styles.title}>
      Session Tracker
    </Title>

    {error && (
      <Text className={styles.errorText}>
        {error}
      </Text>
    )}

    {loading ? (
      <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
    ) : (
      <Stack mt="md">
        <TextInput
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{ width: '100%' }}
        />
        
        <TextInput
          placeholder="Project Description"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          style={{ width: '100%' }}
        />

        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Current Duration: {formatDuration(sessionDuration)}
        </Text>
        
        <Group mt="md" align="center" style={{ marginTop: 15 }}>
          <Button onClick={startSession} disabled={isTimerRunning}>
            Start Session
          </Button>
          <Button onClick={endSession} disabled={!isTimerRunning} color="red">
            End Session
          </Button>
        </Group>    
        
        <Divider style={{ width: '100%', margin: '20px 0' }} />
        
        <Title order={3} className={styles.historyTitle}>
          Project History
        </Title>
        
        {projects.map((project) => {
          const totalCarbonEmissions = sessionHistory
            .filter(session => session.projectName === project.project_name)
            .reduce((acc, session) => acc + session.carbonEmissions, 0);

          return (
            <Card key={project.id} className={styles.projectCard}>
              <Text className={styles.projectName}>Project Name: {project.project_name}</Text>
              <Text className={styles.projectDescription}>Description: {project.project_description}</Text>
              <Text className={styles.historyDetails}>Session Duration: {formatDuration(project.session_duration)}</Text>
              <Text className={styles.historyDetails}>Carbon Emissions: {totalCarbonEmissions.toFixed(4)} kg CO2</Text>

              {/* Dropdown menu for selecting project stage */}
              <Select
                label="Project Stage"
                placeholder="Select a stage"
                data={[
                  { value: 'design', label: 'Design: Creating the software architecture' },
                  { value: 'development', label: 'Development: Writing the actual code' },
                  { value: 'testing', label: 'Testing: Ensuring the software works as expected' },
                ]}
                className={styles.projectStageDropdown}
              />

              <Group className={styles.buttonGroup}>
                <Button size="xs" onClick={() => handleEditProject(project.id)}>
                  Edit
                </Button>
                <Button size="xs" color="red" onClick={() => handleDeleteProject(project.id)}>
                  Delete
                </Button>
              </Group>
            </Card>
          );
        })}
      </Stack>
    )}

    {/* Modal for editing project */}
    <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Project">
      <TextInput 
        placeholder="Project Name" 
        value={projectName} 
        onChange={(e) => setProjectName(e.target.value)} 
      />
      <TextInput 
        placeholder="Project Description" 
        value={projectDescription} 
        onChange={(e) => setProjectDescription(e.target.value)} 
      />
      <Group align="right" mt="md">
        <Button onClick={handleSaveChanges}>Save Changes</Button>
      </Group>
    </Modal>
  </Container>
);
}

export default HistoryComponent;