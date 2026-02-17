import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Placeholder } from '../components/Placeholder';

describe('Placeholder', () => {
  it('renders coming soon text', () => {
    render(<Placeholder />);
    expect(screen.getByText('CollabBoard - Coming Soon')).toBeInTheDocument();
  });
});
