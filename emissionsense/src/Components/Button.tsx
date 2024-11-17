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
  Button,
  Flex 
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://emissionsense-server.onrender.com/checkDeviceType', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const { deviceType } = await response.json();
        setDeviceType(deviceType);

        const endpoint = deviceType === 'Laptop' 
          ? 'https://emissionsense-server.onrender.com/displayuserM' 
          : 'https://emissionsense-server.onrender.com/displayuser';

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
        const response = await fetch('https://emissionsense-server.onrender.com/all_user_projects', {
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
    <Flex justify="center" align="center" style={{ minHeight: '100vh', width: '100%' }}>
      <Container
        size="xl"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '2rem auto',
          padding: isMobile ? '1rem' : '2rem',
          width: '100%',
          maxWidth: '1400px',
        }}
      >
        <Grid gutter={isMobile ? 'sm' : 'xl'} style={{ width: '100%' }}>
          {/* Profile Column */}
            <Grid.Col span={isMobile ? 12 : 3}>
              {!isMobile && (
                <Card
                  shadow="sm"
                  padding={isMobile ? 'md' : 'xl'}
                  style={{ backgroundColor: '#006747', color: 'white', borderRadius: '10px' }}
                >
                  <Stack gap="md">
                    <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px' }}>
                      <Image
                        src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
                        alt="Profile Image"
                        radius="xl"
                        width={150}
                        height={150}
                      />
                    </div>
                    <Text c="white" style={{ fontWeight: 600, fontSize: '24px' }}>
                      {user?.name || 'N/A'}
                    </Text>
                    <Text c="white" style={{ fontSize: '18px' }}>
                      {user?.organization || 'N/A'}
                    </Text>
                  </Stack>
                </Card>
              )}
              {isMobile && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '1rem' 
                }}>
                  <Image
                    src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
                    alt="Profile Image"
                    radius="xl"
                    width={80}
                    height={80}
                  />
                  <div>
                    <Text style={{ fontWeight: 600, fontSize: '18px' }}>
                      {user?.name || 'N/A'}
                    </Text>
                    <Text style={{ fontSize: '14px' }}>
                      {user?.organization || 'N/A'}
                    </Text>
                  </div>
                </div>
              )}
            </Grid.Col>
  
          {/* Profile Details Column */}
          <Grid.Col span={isMobile ? 12 : 9}>
            <Card
              shadow="sm"
              padding={isMobile ? 'md' : 'xl'}
              style={{ backgroundColor: '#ffffff', color: '#333', borderRadius: '10px' }}
            >
              {error && <Text c="red" size="lg">{error}</Text>}
              {loading ? (
                <Loader size="xl" style={{ display: 'block', margin: '2rem auto' }} />
              ) : (
                <Stack gap="md">
                  <Title order={3}>Full Name</Title>
                  <Text size={isMobile ? 'md' : 'lg'}>{user?.name || 'N/A'}</Text>
  
                  <Title order={3}>Email</Title>
                  <Text size={isMobile ? 'md' : 'lg'}>{user?.email || 'N/A'}</Text>
  
                  <Title order={3}>Organization</Title>
                  <Text size={isMobile ? 'md' : 'lg'}>{user?.organization || 'N/A'}</Text>
  
                  <Title order={3}>User Device Specifications</Title>
                  <Grid>
                    <Grid.Col span={isMobile ? 12 : 6}>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>Device Using:</strong> {deviceType || 'N/A'}
                      </Text>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>GPU:</strong> {user?.specifications?.GPU || 'N/A'}
                      </Text>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>GPU Average Watt Usage:</strong> {user?.specifications?.GPU_avg_watt_usage ?? 'N/A'} W
                      </Text>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>CPU:</strong> {user?.specifications?.CPU || 'N/A'}
                      </Text>
                    </Grid.Col>
                    <Grid.Col span={isMobile ? 12 : 6}>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>CPU Average Watt Usage:</strong> {user?.specifications?.CPU_avg_watt_usage ?? 'N/A'} W
                      </Text>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>Motherboard:</strong> {user?.specifications?.motherboard || 'N/A'}
                      </Text>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>RAM:</strong> {user?.specifications?.RAM || 'N/A'}
                      </Text>
                      <Text size={isMobile ? 'md' : 'lg'}>
                        <strong>PSU/Charger Watts:</strong> {user?.specifications?.PSU || 'N/A'}
                      </Text>
                    </Grid.Col>
                  </Grid>
                </Stack>
              )}
            </Card>
          </Grid.Col>
        </Grid>
  
        <Title
          order={2}
          style={{
            color: '#006747',
            fontWeight: 600,
            textAlign: 'center',
            margin: '2rem 0',
            fontSize: isMobile ? '24px' : '32px',
          }}
        >
          Your Projects
        </Title>
  
        <Grid gutter={isMobile ? 'sm' : 'xl'} style={{ width: '100%' }}>
          {projects.length === 0 ? (
            <Grid.Col>
              <Text size="lg" ta="center">No projects found.</Text>
            </Grid.Col>
          ) : (
            projects.map((project) => (
              <Grid.Col span={isMobile ? 12 : 4} key={project.id}>
                <Card
                  shadow="sm"
                  padding="lg"
                  style={{
                    cursor: 'pointer',
                    borderColor: '#006747',
                    borderWidth: 2,
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    height: '100%',
                  }}
                  onClick={() => handleProjectClick(project)}
                >
                  <Text fw={700} size={isMobile ? 'lg' : 'xl'} mb="md" style={{ color: '#006747' }}>
                    Project Title: {project.project_name}
                  </Text>
                  <Text size={isMobile ? 'md' : 'lg'}>
                    <strong>Stage:</strong> {project.stage.length > 35 ? `${project.stage.substring(0, 35)}...` : project.stage}
                  </Text>
                  <Text size={isMobile ? 'md' : 'lg'}>
                    <strong>Status:</strong> {project.status}
                  </Text>
                </Card>
              </Grid.Col>
            ))
          )}
        </Grid>
  
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Project Details"
          size="xl"
          styles={{
            root: { backgroundColor: '#f5f5f5' },
            content: {
              maxWidth: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: isMobile ? '1rem' : '2rem',
            },
            title: {
              color: '#006747',
              fontSize: isMobile ? '20px' : '24px',
            },
          }}
        >
          {selectedProject && (
            <Stack gap="lg">
              <Text size={isMobile ? 'xl' : '2xl'} fw={700}>
                {selectedProject.project_name}
              </Text>
              <Text size={isMobile ? 'md' : 'lg'} style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <strong>Description:</strong> {selectedProject.project_description}
              </Text>
              <Text size={isMobile ? 'md' : 'lg'}>
                <strong>Status:</strong> {selectedProject.status}
              </Text>
              <Text size={isMobile ? 'md' : 'lg'}>
                <strong>Stage:</strong> {selectedProject.stage}
              </Text>
              <Text size={isMobile ? 'md' : 'lg'}>
                <strong>Carbon Emissions:</strong> {selectedProject.carbon_emit} kg CO2e
              </Text>
              <Text size={isMobile ? 'md' : 'lg'}>
                <strong>Session Duration:</strong> {selectedProject.session_duration} seconds
              </Text>
              <Button
                color="red"
                size={isMobile ? 'md' : 'lg'}
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  try {
                    const response = await fetch(`https://emissionsense-server.onrender.com/${selectedProject.id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok) {
                      setModalOpened(false);
                      setProjects(projects.filter((p) => p.id !== selectedProject.id));
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
    </Flex>
  );
  
}

export default HELPComponent;