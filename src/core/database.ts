import { open } from '@op-engineering/op-sqlite';

// Initialize and export the DB instance
export const db = open({
  name: 'pockade.sqlite',
});

export const initializeDatabase = () => {
  // Schema initialization is deferred until specific game modules are added.
  console.log('Database connection initialized.');
};
