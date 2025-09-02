-- Add HASH partitioning to the test table
-- This will distribute the 100k records evenly across 5 partitions
-- Each partition will contain approximately 20k records

-- Create HASH partitions based on the id column
-- This approach avoids MySQL's auto-increment constraints with RANGE partitioning
ALTER TABLE test
PARTITION BY HASH(id)
PARTITIONS 5;

-- Add indexes for better query performance on partitioned table
-- Note: Indexes on partitioned tables work differently - they're created on each partition
CREATE INDEX idx_test_created_at ON test (created_at);
CREATE INDEX idx_test_data ON test (data(100)); -- Prefix index for VARCHAR(255)

-- Create a view for easier querying across partitions
CREATE VIEW test_summary AS
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    COUNT(*) as record_count,
    MIN(created_at) as earliest_record,
    MAX(created_at) as latest_record
FROM test 
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;

-- Create a view to show partition information
CREATE VIEW partition_info AS
SELECT 
    PARTITION_NAME,
    PARTITION_DESCRIPTION,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM INFORMATION_SCHEMA.PARTITIONS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'test' 
  AND PARTITION_NAME IS NOT NULL
ORDER BY PARTITION_ORDINAL_POSITION;
