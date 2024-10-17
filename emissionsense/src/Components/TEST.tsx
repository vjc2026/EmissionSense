import React, { useState, useEffect } from 'react';
import { Container, Card, Group, Text, Divider, Button, Stack } from '@mantine/core';
import styles from './TEST.module.css';
import '@mantine/core/styles.css';

function ProfileComponent() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [projects, setProjects] = useState<any[]>([]); // Store projects

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/user', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          fetchUserProjects(data.user.email);
        }
      } catch (err) {
        console.error('Failed to fetch user data', err);
      }
    };

    const fetchUserProjects = async (email: string) => {
      try {
        const response = await fetch(`http://localhost:5000/user_projects?email=${email}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Projects fetched:', data.projects); // Log the fetched projects
          setProjects(data.projects);
        } else {
          console.error('Failed to fetch projects:', response.status);
        }
      } catch (err) {
        console.error('Error fetching projects', err);
      }
    };

    fetchUserDetails();
  }, []);

  // Log the projects array to check if it's populated
  useEffect(() => {
    console.log('Current projects:', projects);
  }, [projects]);

  return (
    <Container className={styles.profileContainer}>
      <div className={styles.leftSection}>
        <Card className={styles.profileCard}>
          <img src="/path-to-image" alt="User avatar" className={styles.avatar} />
          <Text className={styles.profileName}>John Doe</Text>
          <Text className={styles.profileTitle}>Full Stack Developer</Text>
          <Text className={styles.profileLocation}>Soma, San Francisco, CA</Text>

          <Button className={styles.followButton}>Follow</Button>
          <Button className={styles.messageButton}>Message</Button>

          <div className={styles.socialLinks}>
            <a href="https://bootdey.com">Website: https://bootdey.com</a>
            <a href="https://github.com/bootdey">GitHub: @bootdey</a>
          </div>
        </Card>
      </div>

      <div className={styles.rightSection}>
        <Card className={styles.infoCard}>
          <Text className={styles.fullName}>Full Name: Kenneth Valdez</Text>
          <Text>Email: fip@jukmuh.al</Text>
          <Text>Phone: (239) 816-9029</Text>
          <Text>Mobile: (320) 380-4539</Text>
          <Text>Address: Soma, San Francisco, CA</Text>

          <Divider my="sm" />
          <Text className={styles.assignmentText}>Assignment: Project Status</Text>

          {/* Displaying recent projects */}
          <Stack className={styles.projectsList}>
            <Text fw={500}>Recent Projects:</Text>
            {projects.length > 0 ? (
              projects.map((project) => (
                <Card key={`project-${project.id}`} className={styles.projectCard}>
                  <Text>Project: {project.project_name}</Text>
                  <Text>Description: {project.project_description}</Text>
                </Card>
              ))
            ) : (
              <Text>No recent projects found.</Text>
            )}
          </Stack>
        </Card>
      </div>
    </Container>
  );
}

export default ProfileComponent;
