import { Text } from '@mantine/core';
import { Card, Image, Button, Group } from '@mantine/core';
import classes from './Text.module.css';

const data = [
  {
    title: 'Page views',
    stats: '456,133',
    description: '24% more than in the same month last year, 33% more that two years ago',
  },
  {
    title: 'New users',
    stats: '2,175',
    description: '13% less compared to last month, new user engagement up by 6%',
  },
  {
    title: 'Completed orders',
    stats: '1,994',
    description: '1994 orders were completed this month, 97% satisfaction rate',
  },
];

export function TextComponent() {
  const stats = data.map((stat) => (
    <div key={stat.title} className={classes.stat}>
      <Text className={classes.count}>{stat.title}</Text>
      <Text className={classes.title}>{stat.stats}</Text>
      <Text className={classes.description}>{stat.description}</Text>
    </div>
  ));

  return (
    <div className={classes.container}>
      <div className={classes.root}>{stats}</div>
      <div className={classes.cardContainer}>
        <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
          <Card.Section>
            <Image
              src="https://www.ntaskmanager.com/wp-content/uploads/2020/10/project-design-in-project-management.png"
              height={160}
              alt="Projects"
            />
          </Card.Section>

          <Group mt="md" mb="xs">
            <Text fw={500}>(CURRENT PROJECT)</Text>
          </Group>

          <Text size="sm" color="dimmed">
            Description of the said project
          </Text>

          <Button color="blue" fullWidth mt="md" radius="md">
            View all Projects
          </Button>
        </Card>
        
        <Card shadow="sm" padding="lg" radius="md" withBorder className={classes.card}>
          <Card.Section>
            <Text className={classes.timerText}>00:00:00</Text> {/* Make the timer text bigger */}
          </Card.Section>

          <Group mt="md" mb="xs">
            <Text fw={500}>Timer for (Input Project name)</Text>
          </Group>

          <Text size="sm" color="dimmed">
            Click the timer when you are about to start to do a software project.
          </Text>

          <Button color="blue" fullWidth mt="md" radius="md">
            Start Calculator Timer
          </Button>
        </Card>
        {/* Add more cards here if needed */}
      </div>
    </div>
  );
}

export default TextComponent;
