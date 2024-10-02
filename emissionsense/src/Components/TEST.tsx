import { UnstyledButton, Group, Avatar, Text, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import classes from './TEST.module.css';
import exp from 'constants';

export function UserButton() {
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar
          src="https://i.pinimg.com/originals/2e/dd/02/2edd02160b51797f7adb807a79d96d36.jpg"
          radius="xl"
        />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={700}>
            Aaron Jay C. Bautista
          </Text>

          <Text c="dimmed" size="xs">
            Organization
          </Text>
        </div>

        <IconChevronRight style={{ width: rem(14), height: rem(14) }} stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
}

export default UserButton;