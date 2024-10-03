import React from 'react';
import { Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppShell, Burger, Flex, Button } from '@mantine/core';
import LoginPage from './LoginAndRegister/Login';
import ButtonComponent from './Components/Button';
import TextComponent from './Components/Text';
import Register from './LoginAndRegister/Register';
import Proceed from './LoginAndRegister/Proceed';
import History from './Components/history';
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
        <Button onClick={() => setCurrentComponent('component1')} style={{ margin: '5px' }}>Dashboard</Button>
        <Button onClick={() => setCurrentComponent('component2')} style={{ margin: '5px' }}>Profile Page</Button>
        <Button onClick={() => setCurrentComponent('component3')} style={{ margin: '5px' }}>Statistics</Button>
        <Button onClick={() => setCurrentComponent('component4')} style={{ margin: '5px' }}>Hisory</Button>
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
    </Routes>
  );
};

export default App;
