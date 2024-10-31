import React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppShell, Burger, Flex, Button, UnstyledButton, Group, Avatar, Text, rem } from '@mantine/core';
import LoginPage from './LoginAndRegister/Login';
import ButtonComponent from './Components/Button';
import TextComponent from './Components/Text';
import Register from './LoginAndRegister/Register';
import Proceed from './LoginAndRegister/Proceed';
import History from './Components/history';
import TEST from './Components/TEST';
import UserSpecs from './Components/UserSpecs';
import classes from './Components/TEST.module.css'
import { IconBoxPadding, IconCaretDownFilled  } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import StatisticsComponent from './Components/Statistics';

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token; // Check if the token exists
  return isAuthenticated ? element : <Navigate to="/" />;
};

const MainContent: React.FC = () => {
  const navigate = useNavigate();
  const [opened, setOpened] = React.useState(false);
  const [currentComponent, setCurrentComponent] = React.useState<string>('component1');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Flex justify="space-between" align="center" style={{ padding: '10px 20px' }}>
          <Burger opened={opened} onClick={() => setOpened(!opened)} hiddenFrom="sm" size="sm" />
          <div>Emission Sense</div>
          <Button onClick={handleLogout}>LogOut</Button>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar p="md" style={{ gap: "10px" }}>
        <UnstyledButton className={classes.user} style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
          <Avatar
            src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
            radius="xl"
            size={100}
          />
          <Text size="md" fw={700}>
            Aaron Jay C. Bautista
            <IconCaretDownFilled style={{ width: 20, height: 16, paddingTop: 5} } stroke={2} />
          </Text>
          <Text c="dimmed" size="sm">
            Organization
          </Text>
        </UnstyledButton>
        <Button onClick={() => setCurrentComponent('component1')} style={{ margin: '5px' }}>DashBoard</Button>
        <Button onClick={() => setCurrentComponent('component2')} style={{ margin: '5px' }}>Profile Page</Button>
        <Button onClick={() => setCurrentComponent('component3')} style={{ margin: '5px' }}>Statistics</Button>
        <Button onClick={() => setCurrentComponent('component4')} style={{ margin: '5px' }}>Projects Session Tracker</Button>
      </AppShell.Navbar>

      <AppShell.Main>
        {currentComponent === 'component1' && <TextComponent />}
        {currentComponent === 'component2' && <ButtonComponent />}
        {currentComponent === 'component3' && <StatisticsComponent />}
        {currentComponent === 'component4' && <History />}
      </AppShell.Main>
    </AppShell>
  );
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      {/* Protect the /main route */}
      <Route path="/main" element={<ProtectedRoute element={<MainContent />} />} />
      <Route path="/proceed" element={<Proceed />} />
      <Route path="/test" element={<TEST />} />
      <Route path="/test1" element={<UserSpecs />} />
    </Routes>
  );
};

export default App;