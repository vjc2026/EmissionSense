import { Text, Card, Image, Button, Group, Container, Grid } from '@mantine/core';

const data = [
  {
    title: 'Page views',
    stats: '456,133',
    description: '24% more than in the same month last year, 33% more than two years ago',
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
  const stats = data.map((stat, index) => (
    <Grid.Col span={4} key={index}>
      <Card shadow="sm" padding="lg" radius="md" withBorder style={{ backgroundColor: '#e8f5e9' }}>
        <Text size="lg" fw={500} style={{ color: '#388e3c' }}>{stat.title}</Text>
        <Text size="xl" fw={700} style={{ color: '#1b5e20' }}>{stat.stats}</Text>
        <Text size="sm" c="dimmed">{stat.description}</Text>
      </Card>
    </Grid.Col>
  ));

  return (
    <Container size="xl" py="xl">
      <Grid gutter="xl">
        {stats}
        <Grid.Col span={6}>
          <Card
            h="100%"
            shadow="md"
            padding="xl"
            radius="lg"
            withBorder
            style={{ backgroundColor: '#e8f5e9', borderColor: '#1b5e20' }}
          >
            <Card.Section>
              <Image
                src="https://www.ntaskmanager.com/wp-content/uploads/2020/10/project-design-in-project-management.png"
                height={200}
                alt="Projects"
                style={{ objectFit: 'cover' }}
              />
            </Card.Section>

            <Group mt="xl" mb="md">
              <Text fw={700} size="xl" style={{ color: '#1b5e20' }}>Current Project</Text>
            </Group>

            <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
              Description of the said project
            </Text>

            <Button
              fullWidth
              mt="xl"
              radius="md"
              size="lg"
              variant="gradient"
              gradient={{ from: '#388e3c', to: '#1b5e20' }}
            >
              View all Projects
            </Button>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            h="100%"
            shadow="md"
            padding="xl"
            radius="lg"
            withBorder
            style={{ backgroundColor: '#e8f5e9', borderColor: '#1b5e20' }}
          >
            <Card.Section
              p="xl"
              style={{
                textAlign: 'center',
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="60px" fw={700} style={{ color: '#1b5e20' }}>00:00:00</Text>
            </Card.Section>

            <Group mt="xl" mb="md">
              <Text fw={700} size="xl" style={{ color: '#1b5e20' }}>Timer for Project</Text>
            </Group>

            <Text size="md" c="dimmed" style={{ lineHeight: 1.6 }}>
              Click the timer when you are about to start working on a software project.
            </Text>

            <Button
              fullWidth
              mt="xl"
              radius="md"
              size="lg"
              variant="gradient"
              gradient={{ from: '#388e3c', to: '#1b5e20' }}
            >
              Start Calculator Timer
            </Button>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default TextComponent;
