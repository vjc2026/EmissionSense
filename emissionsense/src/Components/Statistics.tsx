import { Progress, Box, Text, Group, Paper, SimpleGrid, rem } from '@mantine/core';
import { IconArrowUpRight, IconDeviceAnalytics } from '@tabler/icons-react';
import classes from './Statistics.module.css';
import { useState, useEffect } from 'react';
import { Card, Container, Loader, Stack, Title } from '@mantine/core';

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
      <Title order={1}>Organization: {organization}</Title>

      {error && <Text color="red">{error}</Text>}

      {loading ? (
        <Loader size="lg" style={{ display: 'block', margin: '0 auto' }} />
      ) : (
        <Stack mt="md">
          {projects.map((project) => (
            <Card key={project.id} className={classes.projectCard}>
              <Text className={classes.projectOwner}>Owner: {project.owner}</Text>
              <Text className={classes.projectName}>Project Name: {project.project_name}</Text>
              <Text className={classes.projectDescription}>Description: {project.project_description}</Text>
              <Text className={classes.historyDetails}>Session Duration: {project.session_duration} seconds</Text>
              <Text className={classes.historyDetails}>Carbon Emissions: {project.carbon_emit.toFixed(4)} kg CO2</Text>
              <Text className={classes.historyDetails}>Stage: {project.stage}</Text>
              <Text className={classes.historyDetails}>Status: {project.status}</Text>
            </Card>
          ))}

          <Text className={classes.totalEmissions}>
            Total Carbon Emissions: {calculateTotalEmissions()} kg CO2
          </Text>
        </Stack>
      )}
    </Container>
  );
}

export default StatisticsComponent;
