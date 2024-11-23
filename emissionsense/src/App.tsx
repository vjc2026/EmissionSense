import React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppShell, Burger, Flex, Button, UnstyledButton, Group, Avatar, Text, Box, Paper, Loader, Menu, ActionIcon, Indicator } from '@mantine/core';
import { IconBell, IconDashboard, IconUser, IconChartBar, IconHistory, IconLogout } from '@tabler/icons-react';
import LoginPage from './LoginAndRegister/Login';
import ButtonComponent from './Components/Button';
import TextComponent from './Components/Text';
import ResetPassword from './LoginAndRegister/reset-password';
import Register from './LoginAndRegister/Register';
import Proceed from './LoginAndRegister/Proceed';
import History from './Components/history';
import TEST from './Components/TEST';
import Forgotpass from './LoginAndRegister/ForgotPasswordPage';
import UserSpecs from './Components/UserSpecs';
import classes from './Components/TEST.module.css';
import '@mantine/core/styles.css';
import StatisticsComponent from './Components/Statistics';

// DLSU Colors
const dlsuGreen = '#006F3C';
const dlsuLightGreen = '#008C4C';

// ProtectedRoute component to restrict access based on token
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const [loading, setLoading] = React.useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  React.useEffect(() => {
    // Simulate async token check
    setTimeout(() => {
      if (!token) {
        navigate('/');  // Redirect to login if no token
      }
      setLoading(false);
    }, 1000); // Simulate delay or async operation
  }, [token, navigate]);

  if (loading) {
    return <Loader color={dlsuGreen} size="lg" />;  // Show loading spinner
  }

  return token ? element : <Navigate to="/" />;
};

const MainContent: React.FC = () => {
  const navigate = useNavigate();
  const [opened, setOpened] = React.useState(false);
  const [currentComponent, setCurrentComponent] = React.useState<string>('component1');
  const [userData, setUserData] = React.useState<{ name: string; organization: string; profile_image: string | null }>({ name: '', organization: '', profile_image: null });
  const [loading, setLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState<string[]>(['Notification 1', 'Notification 2']);

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
            profile_image: data.user.profile_image || 'https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg', // Fallback image
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
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
            <Flex align="center" gap="md">
          <img
            src="https://i.ibb.co/5KcMwkj/with-bg-Icon.jpg"
            alt="Website Icon"
            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
          />
          <Text size="xl" fw={700} c="white">
            Emission Sense
          </Text>
            </Flex>
            <Group>
  <Menu shadow="md" width={200}>
    <Menu.Target>
      <Indicator label={notifications.length} size={16} color="red">
        <ActionIcon variant="transparent">
          <IconBell size={24} color="white" />
        </ActionIcon>
      </Indicator>
    </Menu.Target>
    <Menu.Dropdown>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <Menu.Item key={index}>{notification}</Menu.Item>
        ))
      ) : (
        <Menu.Item>No notifications</Menu.Item>
      )}
    </Menu.Dropdown>
  </Menu>
<Menu shadow="md" width={200}>
  <Menu.Target>
    <Avatar
      src={userData.profile_image}
      radius="xl"
      size="md"
      styles={{
        root: {
          border: '1px solid white',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      }}
    />
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Item ta="center" onClick={() => setCurrentComponent('component2')}>Your Profile</Menu.Item>
    <Menu.Item ta="center" onClick={handleLogout}>Logout</Menu.Item>
  </Menu.Dropdown>
</Menu>
</Group>
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
        <Box style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
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
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgotpass" element={<Forgotpass />} />
      <Route path="/test" element={<TEST />} />
      <Route path="/test1" element={<UserSpecs />} />
    </Routes>
  );
};

export default App;
