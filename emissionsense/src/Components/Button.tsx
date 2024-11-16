import { useState, useEffect } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Image, 
  Grid, 
  Loader, 
  Stack,
  Modal,
  Button
} from '@mantine/core';

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

  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/checkDeviceType', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const { deviceType } = await response.json();
        setDeviceType(deviceType);

        const endpoint = deviceType === 'Laptop' 
          ? 'http://localhost:5000/displayuserM' 
          : 'http://localhost:5000/displayuser';

        const userResponse = await fetch(endpoint, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const data = await userResponse.json();
          setUser(data.user);
          fetchUserProjects(data.user.email);
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

    const fetchUserProjects = async (_email: string) => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/all_user_projects', {
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

    fetchUserDetails();
  }, []);

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setModalOpened(true);
  };

  return (
    <Container size="lg" style={{ backgroundColor: '#f5f5f5' }}>
      <Grid gutter="md">
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg" style={{ backgroundColor: '#006747', color: 'white', borderRadius: '10px' }}>
            <Image
              src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
              alt="Profile Image"
              radius="xl"
              width={100}
              height={100}
            />
            <Text c="white" style={{ fontWeight: 600, fontSize: '18px' }}>{user?.name || 'N/A'}</Text>
            <Text c="white" style={{ fontSize: '14px' }}>{user?.organization || 'N/A'}</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={8}>
          <Card shadow="sm" padding="lg" style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '10px' }}>
            {error && <Text c="red">{error}</Text>}
            {loading ? (
              <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
            ) : (
              <Stack>
                <Title order={4}>Full Name</Title>
                <Text>{user?.name || 'N/A'}</Text>

                <Title order={4}>Email</Title>
                <Text>{user?.email || 'N/A'}</Text>

                <Title order={4}>Organization</Title>
                <Text>{user?.organization || 'N/A'}</Text>

                <Title order={4}>User Device Specifications</Title>
                <Text><strong>Device Using:</strong> {deviceType || 'N/A'}</Text>
                <Text><strong>GPU:</strong> {user?.specifications.GPU || 'N/A'}</Text>
                <Text><strong>GPU Average Watt Usage:</strong> {user?.specifications.GPU_avg_watt_usage ?? 'N/A'} W</Text>
                <Text><strong>CPU:</strong> {user?.specifications.CPU || 'N/A'}</Text>
                <Text><strong>CPU Average Watt Usage:</strong> {user?.specifications.CPU_avg_watt_usage ?? 'N/A'} W</Text>
                <Text><strong>Motherboard:</strong> {user?.specifications.motherboard || 'N/A'}</Text>
                <Text><strong>RAM:</strong> {user?.specifications.RAM || 'N/A'}</Text>
                <Text><strong>PSU/Charger Watts:</strong> {user?.specifications.PSU || 'N/A'}</Text>
              </Stack>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Title order={3} style={{ color: '#006747', fontWeight: 600 }}>Your Projects</Title>
      <Grid gutter="md">
        {projects.length === 0 ? (
          <Text>No projects found.</Text>
        ) : (
          projects.map(project => (
            <Grid.Col span={4} key={project.id}>
              <Card 
                shadow="sm" 
                padding="lg" 
                style={{
                  cursor: 'pointer',
                  borderColor: '#006747', 
                  borderWidth: 2, 
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => handleProjectClick(project)}
              >
                <Text fw={700} size="lg" mb="xs" style={{ color: '#006747' }}>Project Title: {project.project_name}</Text>
                <Stack align="xs">
                  <Text size="sm" fw="10" style={{ lineHeight: 1.5 }}><strong>Stage:</strong> {project.stage.length > 35 ? `${project.stage.substring(0, 35)}.....` : project.stage}</Text>
                  <Text size="sm"><strong>Status:</strong> {project.status}</Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))
        )}
      </Grid>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Project Details"
        size="lg"
        styles={{
          root: { backgroundColor: '#f5f5f5' },
          content: {
            maxWidth: '80%',
            maxHeight: '80vh',
            overflow: 'auto',
          },
          title: {
            color: '#006747',
          },
        }}
      >
        {selectedProject && (
          <Stack gap="sm">
            <Text size="xl" fw={700}>{selectedProject.project_name}</Text>
            <Text style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <strong>Description:</strong> {selectedProject.project_description}
            </Text>
            <Text><strong>Status:</strong> {selectedProject.status}</Text>
            <Text><strong>Stage:</strong> {selectedProject.stage}</Text>
            <Text><strong>Carbon Emissions:</strong> {selectedProject.carbon_emit} kg CO2e</Text>
            <Text><strong>Session Duration:</strong> {selectedProject.session_duration} seconds</Text>

            <Button 
              color="red"
              onClick={async () => {
                const token = localStorage.getItem('token');
                try {
                  const response = await fetch(`http://localhost:5000/delete_project/${selectedProject.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                  });
                  if (response.ok) {
                    setModalOpened(false);
                    setProjects(projects.filter(p => p.id !== selectedProject.id));
                  } else {
                    setError('Failed to delete project');
                  }
                } catch (err) {
                  console.error('Error deleting project:', err);
                  setError('An error occurred while deleting the project');
                }
              }}
            >
              Delete Project
            </Button>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

export default HELPComponent;


// Modify the Container component's style to include centering properties
<Container 
  size="lg" 
  style={{ 
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 auto',
    padding: '2rem',
    maxWidth: '1200px'  // You can adjust this value
  }}
>
  <Grid 
    gutter="md" 
    style={{ 
      width: '100%',
      justifyContent: 'center' 
    }}
  >
    {/* Rest of your Grid content remains the same */}
  </Grid>

  <Title 
    order={3} 
    style={{ 
      color: '#006747', 
      fontWeight: 600,
      textAlign: 'center',
      marginTop: '2rem'
    }}
  >
    Your Projects
  </Title>
  
  <Grid 
    gutter="md"
    style={{ 
      width: '100%',
      justifyContent: 'center'
    }}
  >
    {/* Rest of your projects Grid content remains the same */}
  </Grid>

  {/* Modal remains the same */}
</Container>
