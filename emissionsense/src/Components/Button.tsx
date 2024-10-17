import { Container, Title, Button, Text, Card, Image, Group, Badge, Grid, Progress } from '@mantine/core';
import { IconGlobe, IconBrandGithub, IconBrandTwitter, IconBrandInstagram, IconBrandFacebook } from '@tabler/icons-react';

export function ButtonComponent() {
  return (
    <Container size="lg">
      <Grid gutter="md">
        {/* Left Profile Section */}
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Image
              src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
              alt="Profile Image"
              radius="xl"
              width={100}
              height={100}
              mx="auto"
            />
            <Text size="lg" style={{ align:'center', fontWeight: 700 }} mt="md">
              John Doe
            </Text>
            <Text style={{ align:'center'}} size="sm" color="dimmed">
              Full Stack Developer
            </Text>
            <Text style={{ align:'center'}} size="sm" color="dimmed">
              Soma, San Francisco, CA
            </Text>
            <Group style={{ flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
              <Button size="sm" variant="light">Follow</Button>
              <Button size="sm" variant="outline">Message</Button>
            </Group>

            <Group style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '1.5rem' }}>
              <Button variant="subtle" fullWidth leftSection={<IconGlobe style={{ width: 20, height: 20 }} stroke={1.5} />}>
                Website: https://bootdey.com
              </Button>
              <Button variant="subtle" fullWidth leftSection={<IconBrandGithub style={{ width: 20, height: 20 }} stroke={1.5} />}>
                Github: @bootdey
              </Button>
              <Button variant="subtle" fullWidth leftSection={<IconBrandTwitter style={{ width: 20, height: 20 }} stroke={1.5} />}>
                Twitter: @bootdey
              </Button>
              <Button variant="subtle" fullWidth leftSection={<IconBrandInstagram style={{ width: 20, height: 20 }} stroke={1.5} />}>
                Instagram: bootdey
              </Button>
              <Button variant="subtle" fullWidth leftSection={<IconBrandFacebook style={{ width: 20, height: 20 }} stroke={1.5} />}>
                Facebook: bootdey
              </Button>
            </Group>
          </Card>
        </Grid.Col>

        {/* Right Information Section */}
        <Grid.Col span={8}>
          <Card shadow="sm" padding="lg">
            <Title order={4} mb="sm">Full Name</Title>
            <Text>Kenneth Valdez</Text>

            <Title order={4} mt="lg" mb="sm">Email</Title>
            <Text>fip@jukmuh.al</Text>

            <Title order={4} mt="lg" mb="sm">Phone</Title>
            <Text>(239) 816-9029</Text>

            <Title order={4} mt="lg" mb="sm">Mobile</Title>
            <Text>(320) 380-4539</Text>

            <Title order={4} mt="lg" mb="sm">Address</Title>
            <Text>Soma, San Francisco, CA</Text>

            <Title order={4} mt="lg" mb="sm">
              <Text component="span" color="blue">Assignment</Text> Project Status
            </Title>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default ButtonComponent;
