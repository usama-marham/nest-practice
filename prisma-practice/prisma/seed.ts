import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sample data for generating random content
const sampleData = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
  'Qui officia deserunt mollit anim id est laborum.',
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem.',
  'Accusantium doloremque laudantium, totam rem aperiam.',
  'Eaque ipsa quae ab illo inventore veritatis et quasi architecto.',
  'Beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem.',
  'Quia voluptas sit aspernatur aut odit aut fugit.',
  'Sed quia consequuntur magni dolores eos qui ratione voluptatem.',
  'Sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum.',
  'Quia dolor sit amet, consectetur, adipisci velit.',
  'Sed quia non numquam eius modi tempora incidunt ut labore.',
  'Et dolore magnam aliquam quaerat voluptatem.',
  'Ut enim ad minima veniam, quis nostrum exercitationem.',
  'Ullam corporis suscipit laboriosam, nisi ut aliquid ex ea.',
  'Commodi consequatur? Quis autem vel eum iure reprehenderit.',
  'Qui in ea voluptate velit esse quam nihil molestiae consequatur.'
];

function getRandomData(): string {
  return sampleData[Math.floor(Math.random() * sampleData.length)];
}

function getRandomDateInRange(startDate: Date, endDate: Date): Date {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}

async function generateTestRecords() {
  console.log('Starting to generate 100,000 test records...');
  
  const now = new Date();
  const months: { start: Date; end: Date }[] = [];
  
  // Calculate date ranges for months 5,6,7,8,9 (May-September 2024)
  const targetMonths = [5, 6, 7, 8, 9]; // May, June, July, August, September
  const year = 2024;
  
  for (const month of targetMonths) {
    const monthStart = new Date(year, month - 1, 1); // month - 1 because Date months are 0-indexed
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999); // Last day of the month
    months.push({ start: monthStart, end: monthEnd });
  }
  
  // Generate 20k records for each month (100k total / 5 months = 20k per month)
  for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
    const { start, end } = months[monthIndex];
    const monthName = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    console.log(`Generating 20,000 records for ${monthName}...`);
    
    const batchSize = 1000; // Process in batches of 1000 for better performance
    const totalBatches = 20000 / batchSize;
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const records: { data: string; createdAt: Date; updatedAt: Date }[] = [];
      
      for (let i = 0; i < batchSize; i++) {
        records.push({
          data: getRandomData(),
          createdAt: getRandomDateInRange(start, end),
          updatedAt: new Date(),
        });
      }
      
      await prisma.test.createMany({
        data: records,
        skipDuplicates: true,
      });
      
      // Progress indicator
      if ((batch + 1) % 5 === 0) {
        console.log(`  Batch ${batch + 1}/${totalBatches} completed for ${monthName}`);
      }
    }
    
    console.log(`✅ Completed ${monthName}: 20,000 records`);
  }
  
  console.log('🎉 Successfully generated 100,000 test records!');
}

async function unseedTestRecords() {
  console.log('Starting to clear all test records...');
  
  const startTime = Date.now();
  
  // Get count before deletion
  const countBefore = await prisma.test.count();
  console.log(`Found ${countBefore} records to delete`);
  
  if (countBefore === 0) {
    console.log('No records found to delete');
    return;
  }
  
  // Delete all records from test table
  const deleteResult = await prisma.test.deleteMany({});
  
  const queryTime = Date.now() - startTime;
  
  console.log(`✅ Successfully deleted ${deleteResult.count} records in ${queryTime}ms`);
  
  // Verify deletion
  const countAfter = await prisma.test.count();
  console.log(`Records remaining: ${countAfter}`);
}

async function unseedByMonth(month: number, year: number = 2024) {
  console.log(`Starting to clear records for ${month}/${year}...`);
  
  const startTime = Date.now();
  
  // Calculate date range for the specified month
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
  
  // Get count before deletion
  const countBefore = await prisma.test.count({
    where: {
      createdAt: {
        gte: monthStart,
        lte: monthEnd
      }
    }
  });
  
  console.log(`Found ${countBefore} records to delete for ${month}/${year}`);
  
  if (countBefore === 0) {
    console.log('No records found to delete for this month');
    return;
  }
  
  // Delete records for the specified month
  const deleteResult = await prisma.test.deleteMany({
    where: {
      createdAt: {
        gte: monthStart,
        lte: monthEnd
      }
    }
  });
  
  const queryTime = Date.now() - startTime;
  
  console.log(`✅ Successfully deleted ${deleteResult.count} records in ${queryTime}ms`);
  
  // Verify deletion
  const countAfter = await prisma.test.count({
    where: {
      createdAt: {
        gte: monthStart,
        lte: monthEnd
      }
    }
  });
  console.log(`Records remaining for ${month}/${year}: ${countAfter}`);
}

async function showTestStats() {
  console.log('📊 Test Table Statistics:');
  
  const totalCount = await prisma.test.count();
  console.log(`Total records: ${totalCount}`);
  
  if (totalCount === 0) {
    console.log('No records found in test table');
    return;
  }
  
  // Show distribution by month
  const monthlyDistribution = await prisma.$queryRaw`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      COUNT(*) as count
    FROM test 
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
  `;
  
  console.log('\nMonthly distribution:');
  console.table(monthlyDistribution);
  
  // Show partition information if available
  try {
    const partitionInfo = await prisma.$queryRaw`
      SELECT 
        PARTITION_NAME,
        TABLE_ROWS,
        DATA_LENGTH,
        INDEX_LENGTH
      FROM INFORMATION_SCHEMA.PARTITIONS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'test' 
        AND PARTITION_NAME IS NOT NULL
      ORDER BY PARTITION_ORDINAL_POSITION
    `;
    
    console.log('\nPartition information:');
    console.table(partitionInfo);
  } catch (error) {
    console.log('\nPartition information not available (table may not be partitioned yet)');
  }
}

async function main() {
  try {
    // Check command line arguments to determine action
    const args = process.argv.slice(2);
    const action = args[0];
    const param1 = args[1];
    const param2 = args[2];
    
    switch (action) {
      case 'unseed':
        if (param1 && param2) {
          // Unseed specific month: npm run seed unseed 5 2024
          await unseedByMonth(parseInt(param1), parseInt(param2));
        } else {
          // Unseed all records
          await unseedTestRecords();
        }
        break;
        
      case 'stats':
        // Show statistics
        await showTestStats();
        break;
        
      case 'help':
        console.log(`
🌱 Test Table Seeder Commands:

  npm run seed                    # Generate 100k test records (May-Sep 2024)
  npm run seed unseed            # Delete all test records
  npm run seed unseed 5 2024     # Delete records for May 2024
  npm run seed stats             # Show table statistics and partition info
  npm run seed help              # Show this help message

📊 Data Distribution:
  - 100,000 total records
  - 20,000 records per month (May-September 2024)
  - Random timestamps within each month
  - Optimized for RANGE partitioning

🎯 Use Cases:
  - Performance testing before/after partitioning
  - Database reset for testing
  - Monthly data cleanup
  - Partition verification
        `);
        break;
        
      default:
        // Default action: generate test records
        await generateTestRecords();
        await showTestStats();
        break;
    }
    
  } catch (error) {
    console.error('Error in seed operation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
