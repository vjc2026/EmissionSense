import React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppShell, Burger, Flex, Button, UnstyledButton, Group, Avatar, Text, Box, Paper } from '@mantine/core';
import LoginPage from './LoginAndRegister/Login';
import ButtonComponent from './Components/Button';
import TextComponent from './Components/Text';
import Register from './LoginAndRegister/Register';
import Proceed from './LoginAndRegister/Proceed';
import History from './Components/history';
import TEST from './Components/TEST';
import Forgotpass from './LoginAndRegister/ForgotPasswordPage';
import UserSpecs from './Components/UserSpecs';
import classes from './Components/TEST.module.css';
import { IconBoxPadding, IconCaretDownFilled, IconDashboard, IconUser, IconChartBar, IconHistory } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import StatisticsComponent from './Components/Statistics';

// DLSU Colors
const dlsuGreen = '#006F3C';
const dlsuLightGreen = '#008C4C';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  return isAuthenticated ? element : <Navigate to="/" />;
};

const MainContent: React.FC = () => {
  const navigate = useNavigate();
  const [opened, setOpened] = React.useState(false);
  const [currentComponent, setCurrentComponent] = React.useState<string>('component1');
  const [userData, setUserData] = React.useState({ name: '', organization: '' });

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUserData({
            name: data.user.name,
            organization: data.user.organization,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header
        style={{
          background: dlsuGreen,
          borderBottom: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Flex justify="space-between" align="center" style={{ padding: '10px 20px', height: '100%' }}>
          <Burger
            opened={opened}
            onClick={() => setOpened(!opened)}
            hiddenFrom="sm"
            size="sm"
            color="white"
          />
          <Text size="xl" fw={700} c="white">
            Emission Sense
          </Text>
          <Button
            variant="white"
            onClick={handleLogout}
            styles={{
              root: {
                '&:hover': {
                  backgroundColor: '#e7f5ff',
                  color: dlsuGreen,
                },
              },
            }}
          >
            LogOut
          </Button>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        style={{
          background: 'white',
          borderRight: 'none',
          boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
        }}
      >
        <Paper
          shadow="xs"
          p="md"
          mb="md"
          style={{
            borderRadius: '10px',
            background: '#f8f9fa',
          }}
        >
          <UnstyledButton
            className={classes.user}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Avatar
              src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
              radius="xl"
              size={100}
              style={{ border: `3px solid ${dlsuGreen}` }}
            />
            <Box>
              <Text size="md" fw={700} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {userData.name}
              </Text>
              <Text c="dimmed" size="sm" ta="center">
                {userData.organization}
              </Text>
            </Box>
          </UnstyledButton>
        </Paper>

        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            leftSection={<IconDashboard size={20} />}
            variant={currentComponent === 'component1' ? 'filled' : 'light'}
            onClick={() => setCurrentComponent('component1')}
            fullWidth
            styles={{
              root: {
                backgroundColor: currentComponent === 'component1' ? dlsuGreen : undefined,
                '&:hover': {
                  backgroundColor: dlsuLightGreen,
                },
                color: currentComponent === 'component1' ? 'white' : dlsuGreen,
              },
            }}
          >
            Dashboard
          </Button>
          <Button
            leftSection={<IconUser size={20} />}
            variant={currentComponent === 'component2' ? 'filled' : 'light'}
            onClick={() => setCurrentComponent('component2')}
            fullWidth
            styles={{
              root: {
                backgroundColor: currentComponent === 'component2' ? dlsuGreen : undefined,
                '&:hover': {
                  backgroundColor: dlsuLightGreen,
                },
                color: currentComponent === 'component2' ? 'white' : dlsuGreen,
              },
            }}
          >
            Profile Page
          </Button>
          <Button
            leftSection={<IconChartBar size={20} />}
            variant={currentComponent === 'component3' ? 'filled' : 'light'}
            onClick={() => setCurrentComponent('component3')}
            fullWidth
            styles={{
              root: {
                backgroundColor: currentComponent === 'component3' ? dlsuGreen : undefined,
                '&:hover': {
                  backgroundColor: dlsuLightGreen,
                },
                color: currentComponent === 'component3' ? 'white' : dlsuGreen,
              },
            }}
          >
            Statistics
          </Button>
          <Button
            leftSection={<IconHistory size={20} />}
            variant={currentComponent === 'component4' ? 'filled' : 'light'}
            onClick={() => setCurrentComponent('component4')}
            fullWidth
            styles={{
              root: {
                backgroundColor: currentComponent === 'component4' ? dlsuGreen : undefined,
                '&:hover': {
                  backgroundColor: dlsuLightGreen,
                },
                color: currentComponent === 'component4' ? 'white' : dlsuGreen,
              },
            }}
          >
            Projects Session Tracker
          </Button>
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <Paper>
          {currentComponent === 'component1' && <TextComponent />}
          {currentComponent === 'component2' && <ButtonComponent />}
          {currentComponent === 'component3' && <StatisticsComponent />}
          {currentComponent === 'component4' && <History />}
        </Paper>
      </AppShell.Main>
    </AppShell>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/main" element={<ProtectedRoute element={<MainContent />} />} />
      <Route path="/proceed" element={<Proceed />} />
      <Route path="/forgotpass" element={<Forgotpass />} />
      <Route path="/test" element={<TEST />} />
      <Route path="/test1" element={<UserSpecs />} />
    </Routes>
  );
};

export default App;
