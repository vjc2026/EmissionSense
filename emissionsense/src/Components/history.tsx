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
  const [organization, setOrganization] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectDescription, setProjectDescription] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [carbonEmit, setcarbonEmit] = useState<number>(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [projectStage, setProjectStage] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editableProject, setEditableProject] = useState<any | null>(null);

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
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
        const response = await fetch('https://emissionsense-server.onrender.com/user', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); 
          setOrganization(data.user.organization);
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
      const response = await fetch(`https://emissionsense-server.onrender.com/user_projects?email=${email}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setcarbonEmit(data.carbon_emit);
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
    // Check for empty inputs
    if (!projectName || !projectDescription) {
      setError('Please Select a Project before starting the calculator.');
      return;
    }
    const token = localStorage.getItem('token');
    console.log("Starting session with:", projectName, projectDescription);
 
    try {
       const response = await fetch(`https://emissionsense-server.onrender.com/find_project`, {
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
       setError(' ');
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
      organization,
      projectStage
    };

    try {
      const deviceTypeResponse = await fetch('https://emissionsense-server.onrender.com/checkDeviceType', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!deviceTypeResponse.ok) {
        throw new Error(`Failed to fetch device type: ${deviceTypeResponse.statusText}`);
      }

      const { deviceType } = await deviceTypeResponse.json();

      const emissionsEndpoint = deviceType === 'Laptop' 
        ? 'https://emissionsense-server.onrender.com/calculate_emissionsM'
        : 'https://emissionsense-server.onrender.com/calculate_emissions';

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

        const updateResponse = await fetch('https://emissionsense-server.onrender.com/user_Update', {
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
            { projectName: historyData.projectName, projectDescription: historyData.projectDescription, sessionDuration: historyData.sessionDuration, carbonEmissions, organization: historyData.organization, projectStage: historyData.projectStage },
          ]);
        } else {
          const result = await updateResponse.json();
          setError(result.error || 'Failed to record session.');
        }
    } catch (err) {
      console.error('Error in endSession:', err);
      setError('An error occurred while recording the session.');
    }
};


  const handleSaveChanges = async () => {
    if (!editableProject) return;

    const token = localStorage.getItem('token');
    const updatedProject = { projectName, projectDescription, projectStage };

    try {
      const response = await fetch(`https://emissionsense-server.onrender.com/update_project/${editableProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProject),
      });

      if (response.ok) {
        fetchUserProjects(user?.email!); 
        setIsModalOpen(false);
        setEditableProject(null);
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
      const response = await fetch(`https://emissionsense-server.onrender.com/delete_project/${projectId}`, {
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
    const projectToEdit = projects.find((p) => p.id === projectId);
    if (projectToEdit) {
      setProjectName(projectToEdit.project_name);
      setProjectDescription(projectToEdit.project_description);
      setProjectStage(projectToEdit.projectStage);
      setEditableProject(projectToEdit);
      setIsModalOpen(true);
    }
  };

  const createProject = async () => {
    if (!projectName || !projectDescription || !projectStage) {
      setError('All fields are required.');
      return; // Exit the function if any required field is missing
    }
    const token = localStorage.getItem('token');
    const projectData = {
      projectName,
      projectDescription,
      organization,
      projectStage,
      sessionDuration: 0,
      carbonEmit: 0,
      status: "In-Progress",
    };
    try {
      // Check if a project with the same name exists
      const checkResponse = await fetch('https://emissionsense-server.onrender.com/check_existing_projectname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ projectName }),
      });
  
      const existingProject = await checkResponse.json();
  
      // If project with the same name exists, show error and close modal
      if (existingProject.exists) {
        setError('A project with this name already exists.');
        return; // Exit the function early
      }
  
      // No existing project, create the new one
      const response = await fetch('https://emissionsense-server.onrender.com/user_history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      });
      
      if (response.ok) {
        setProjectName('');
        setProjectDescription('');
        setProjectStage('');
        setSessionDuration(0);
        fetchUserProjects(user?.email!); // Refresh the project list
        console.log('Project successfully created in user history.');
        setIsCreateModalOpen(false); // Close the modal on success
        setError(' ');
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to create project in user history.');
      }
    } catch (err) {
      console.error('Error in createProject:', err);
      setError('An error occurred while creating the project.');
    }
  };

  const stages = [
    "Design: Creating the software architecture",
    "Development: Writing the actual code",
    "Testing: Ensuring the software works as expected"
  ];
  
  const handleCompleteStage = async (projectId: number) => {
    if (!projectName || !projectDescription || !projectStage) {
      setError('Are you sure you want to complete this project? (Click again to confirm)');
      return;
    }

    const token = localStorage.getItem('token');

    // Define project stages
    const projectStages = [
      'Design: Creating the software architecture',
      'Development: Writing the actual code', 
      'Testing: Ensuring the software works as expected'
    ];

    // Get current stage index
    const currentStageIndex = projectStages.indexOf(projectStage);

    // Check if current stage is the last stage
    const isLastStage = currentStageIndex === projectStages.length - 1;

    try {
      const response = await fetch(`https://emissionsense-server.onrender.com/complete_project/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Only include nextStage if not in last stage
          ...(isLastStage ? {} : { nextStage: projectStages[currentStageIndex + 1] })
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to complete project: ${response.statusText}`);
      }

      if (isLastStage) {
        setError('Project is now complete! All stages finished.');
      } else {
        setError('');
      }

      // Reset form fields and refresh projects
      setProjectName('');
      setProjectDescription('');
      setProjectStage('');
      fetchUserProjects(user?.email!);

    } catch (err) {
      console.error('Error in completing project stage:', err);
      setError('An error occurred while completing the project stage.');
    }
  };
  
  return (
    <Container className={styles.container}>
      <Title order={1} className={styles.title}>
        Session Tracker
      </Title>

      {error && (
        <Text className={styles.errorText} color='red'>
          {error}
        </Text>
      )}

      {loading ? (
        <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
      ) : (
        <Stack mt="md">
          <TextInput
            placeholder="Project Name"
            label="Project Title"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            style={{ width: '100%' }}
            readOnly
          />
          
          <TextInput
            placeholder="Project Description"
            label="Project Description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            style={{ width: '100%' }}
            readOnly
          />

          <Select
            label="Project Stage"
            placeholder="Select a stage"
            data={[
              { value: 'Design: Creating the software architecture', label: 'Design: Creating the software architecture' },
              { value: 'Development: Writing the actual code', label: 'Development: Writing the actual code' },
              { value: 'Testing: Ensuring the software works as expected', label: 'Testing: Ensuring the software works as expected' },
            ]}
            value={projectStage}
            onChange={setProjectStage}
            className={styles.projectStageDropdown}
            readOnly
          />

          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            Current Duration: {formatDuration(sessionDuration)}
          </Text>
          
          <Group mt="md" align="center" style={{ marginTop: 15 }}>
          <Button onClick={() => setIsCreateModalOpen(true)} style={{ backgroundColor: '#006400', color: '#fff'}}>
            Create Project
            </Button>
            <Button onClick={startSession} disabled={isTimerRunning} style={{ backgroundColor: '#006400', color: '#fff' }}>
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
                <Text className={styles.historyDetails}>Carbon Emissions: {project.carbon_emit.toFixed(2)} kg CO2</Text>
                <Text className={styles.projectStage}>Project Stage: {project.stage}</Text>
                <Group className={styles.buttonGroup}>
                <Button size="xs" onClick={() => {
              setProjectName(project.project_name);
              setProjectDescription(project.project_description);
              setProjectStage(project.stage);
              }}>
              Select
              </Button>
                <Button size="xs" onClick={() => handleEditProject(project.id)} style={{ backgroundColor: '#006400', color: '#fff' }}>
                Edit
                </Button>
                <Button size="xs" color="red" onClick={() => {
                setProjectName(project.project_name);
                setProjectDescription(project.project_description);
                setProjectStage(project.stage);
                handleDeleteProject(project.id);
                }}>
                Delete
                </Button>
                <Button 
                size="xs" 
                color="blue" 
                onClick={() => {
                setProjectName(project.project_name);
                setProjectDescription(project.project_description);
                setProjectStage(project.stage);
                handleCompleteStage(project.id);
                }}>
                Complete Stage
                </Button>
                </Group>
                </Card>
            );
          })}
        </Stack>
      )}

        {/* Create Project Modal */}
        <Modal opened={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Project">
        <TextInput
          label="Project Name"
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{ width: '100%' }}
          required
        />
        <TextInput
          label="Project Description"
          placeholder="Project Description"
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          style={{ width: '100%' }}
          required
        />
        <Select
          label="Project Stage"
          placeholder="Select a stage"
          data={[
            { value: 'Design: Creating the software architecture', label: 'Design: Creating the software architecture' },
            { value: 'Development: Writing the actual code', label: 'Development: Writing the actual code' },
            { value: 'Testing: Ensuring the software works as expected', label: 'Testing: Ensuring the software works as expected' },
          ]}
          value={projectStage}
          onChange={setProjectStage}
          required
        />
        {error && (
          <Text color="red" style={{ marginTop: '10px', fontSize: '14px' }}>
            {error}
          </Text>
        )}
        <Group align="right" mt="md">
          <Button onClick={createProject} style={{ backgroundColor: '#006400', color: '#fff' }}>Create</Button>
        </Group>
      </Modal>
      
      <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Project">
        <TextInput 
          label="Project Title"
          placeholder="Project Name" 
          value={projectName} 
          onChange={(e) => setProjectName(e.target.value)} 
        />
        <TextInput 
          label="Project Description"
          placeholder="Project Description" 
          value={projectDescription} 
          onChange={(e) => setProjectDescription(e.target.value)} 
        />
        <Select
          label="Project Stage"
          placeholder="Select a stage"
          data={[
            { value: 'Design: Creating the software architecture', label: 'Design: Creating the software architecture' },
            { value: 'Development: Writing the actual code', label: 'Development: Writing the actual code' },
            { value: 'Testing: Ensuring the software works as expected', label: 'Testing: Ensuring the software works as expected' },
          ]}
          value={projectStage}
          onChange={setProjectStage}
          className={styles.projectStageDropdown}
        />
        <Group align="right" mt="md">
          <Button onClick={handleSaveChanges} style={{ backgroundColor: '#006400', color: '#fff' }}>Save Changes</Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default HistoryComponent;