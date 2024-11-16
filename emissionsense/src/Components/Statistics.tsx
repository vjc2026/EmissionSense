import { Text, Group, Card, Container, Loader, Stack, Title, Grid, Badge } from '@mantine/core';
import { useState, useEffect } from 'react';

export function StatisticsComponent() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  
  useEffect(() => {
    const fetchProjects = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please log in.');
        setLoading(false);
        return;
      }

      try {
        const userResponse = await fetch('http://localhost:5000/user', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setOrganization(userData.user.organization);

          const projectsResponse = await fetch(`http://localhost:5000/organization_projects?organization=${userData.user.organization}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            setProjects(projectsData.projects);
          } else {
            const result = await projectsResponse.json();
            setError(result.error || 'Failed to fetch projects.');
          }
        } else {
          const result = await userResponse.json();
          setError(result.error || 'Failed to fetch user details.');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while fetching projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const calculateTotalEmissions = () => {
    return projects.reduce((total, project) => total + project.carbon_emit, 0).toFixed(4);
  };

  return (
    <Container>
      <Title order={1} mt="md">Organization: {organization}</Title>

      {error && <Text color="red">{error}</Text>}

      {loading ? (
        <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
      ) : (
        <Stack mt="md">
            <Grid>
            {projects.map((project) => (
              <Grid.Col span={12} key={project.id}>
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
                <Group align="apart" style={{ marginBottom: 5 }}>
                <Text fw={500}>Project Title: {project.project_name}</Text> 
                <Badge color="green" variant="light">
                  Project {project.status}
                </Badge>
                </Group>
                <Text size="sm" fw="10" style={{ lineHeight: 1.5 }}>
                  Project Description: {project.project_description.length > 100 ? `${project.project_description.substring(0, 100)}.........` : project.project_description}
                </Text>
                <Text size="sm" color="dimmed">
                Owner: {project.owner}
                </Text>
                <Text size="sm" color="dimmed">
                Session Duration: {project.session_duration} seconds
                </Text>
                <Text size="sm" color="dimmed">
                Carbon Emissions: {project.carbon_emit.toFixed(2)} kg CO2
                </Text>
                <Text size="sm" color="dimmed">
                Stage: {project.stage}
                </Text>
              </Card>
              </Grid.Col>
            ))}
            </Grid>

          <Text size="lg" fw={500} mt="md">
            Total Carbon Emissions: {calculateTotalEmissions()} kg CO2
          </Text>
        </Stack>
      )}
    </Container>
  );
}

export default StatisticsComponent;
