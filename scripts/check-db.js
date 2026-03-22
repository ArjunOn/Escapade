const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  try {
    const count = await p.externalEvent.count();
    console.log('ExternalEvent table exists. Row count:', count);
    const uaCount = await p.userAvailability.count();
    console.log('UserAvailability table exists. Row count:', uaCount);
    const seCount = await p.savedEvent.count();
    console.log('SavedEvent table exists. Row count:', seCount);
  } catch(e) {
    console.error('Table check failed:', e.message);
  } finally {
    await p.$disconnect();
  }
}
main();
