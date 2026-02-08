import { defineCliConfig } from 'prisma/cli';

export default defineCliConfig({
  seed: {
    exec: 'ts-node prisma/seed.ts',
  },
});
