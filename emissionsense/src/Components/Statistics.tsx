import { Progress, Box, Text, Group, Paper, SimpleGrid, rem } from '@mantine/core';
import { IconArrowUpRight, IconDeviceAnalytics } from '@tabler/icons-react';
import classes from './Statistics.module.css';

export function StatisticsComponent() {
  return (
      <Text c="dimmed" fz="sm">
        Page views compared to previous month
      </Text>
  );
}

export default StatisticsComponent;