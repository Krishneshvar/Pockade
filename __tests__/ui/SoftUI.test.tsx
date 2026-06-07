import React from 'react';
import { render } from '@testing-library/react-native';
import { Card } from '../../src/ui/Card';
import { Button } from '../../src/ui/Button';
import { Typography } from '../../src/ui/Typography';

describe('Soft UI components', () => {
  it('mounts the primary shell primitives', async () => {
    const screen = await render(
      <>
        <Card>
          <Typography>Card content</Typography>
        </Card>
        <Button title="Play" onPress={jest.fn()} />
      </>
    );

    expect(screen.getByText('Card content')).toBeTruthy();
    expect(screen.getByText('Play')).toBeTruthy();
  });
});
