import { describe, expect, it } from 'vitest';
import app from '../app.js';

type RouteLayer = {
  route?: {
    path?: string;
    methods?: {
      get?: boolean;
    };
  };
};

describe('server app', () => {
  it('registers the health route', () => {
    const router = (app as unknown as { _router?: { stack?: RouteLayer[] } })._router;
    const stack = router?.stack ?? [];

    const hasHealthRoute = stack.some(
      (layer) => layer.route?.path === '/health' && layer.route?.methods?.get === true
    );

    expect(hasHealthRoute).toBe(true);
  });
});
