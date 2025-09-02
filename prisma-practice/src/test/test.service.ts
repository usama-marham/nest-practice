import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export interface TestQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'data';
  sortOrder?: 'asc' | 'desc';
}

export interface TestResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  queryTime: number;
}

@Injectable()
export class TestService {
    constructor(private prismaService: PrismaService) {}

    async findAll(params: TestQueryParams = {}): Promise<TestResponse> {
        const startTime = Date.now();
        
        const {
            page =1,
            limit=20,
            search = '',
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = params;

        // Build where clause
        const where: any = {};

        // Search functionality
        if (search) {
            where.data = {
                contains: search
            };
        }

        // Date range filtering
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute queries in parallel for better performance
        const [data, total] = await Promise.all([
            this.prismaService.test.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder
                }
            }),
            this.prismaService.test.count({ where })
        ]);

        const queryTime = Date.now() - startTime;

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            queryTime
        };
    }

    async findById(id: number): Promise<any> {
        const startTime = Date.now();
        
        const result = await this.prismaService.test.findUnique({
            where: { id }
        });

        const queryTime = Date.now() - startTime;
        
        return {
            ...result,
            queryTime
        };
    }

    async getStats(): Promise<any> {
        const startTime = Date.now();

        const [
            totalRecords,
            monthlyStats,
            recentRecords
        ] = await Promise.all([
            this.prismaService.test.count(),
            this.prismaService.$queryRaw`
                SELECT 
                    DATE_FORMAT(created_at, '%Y-%m') as month,
                    COUNT(*) as count
                FROM test 
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `,
            this.prismaService.test.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            })
        ]);

        const queryTime = Date.now() - startTime;

        return {
            totalRecords,
            monthlyStats,
            recentRecords,
            queryTime
        };
    }

    async searchByDateRange(startDate: string, endDate: string, limit: number = 100): Promise<any> {
        const startTime = Date.now();

        const data = await this.prismaService.test.findMany({
            where: {
                createdAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const queryTime = Date.now() - startTime;

        return {
            data,
            count: data.length,
            queryTime,
            dateRange: { startDate, endDate }
        };
    }

    async getPerformanceMetrics(): Promise<any> {
        const startTime = Date.now();

        // Test different query types to measure performance
        const queries = [
            {
                name: 'Count All Records',
                query: () => this.prismaService.test.count()
            },
            {
                name: 'Find Recent 100',
                query: () => this.prismaService.test.findMany({
                    take: 100,
                    orderBy: { createdAt: 'desc' }
                })
            },
            {
                name: 'Search by Data',
                query: () => this.prismaService.test.findMany({
                    where: {
                        data: {
                            contains: 'Lorem'
                        }
                    },
                    take: 50
                })
            },
            {
                name: 'Date Range Query (May 2024)',
                query: () => this.prismaService.test.findMany({
                    where: {
                        createdAt: {
                            gte: new Date('2024-05-01'),
                            lte: new Date('2024-05-31')
                        }
                    },
                    take: 100
                })
            },
            {
                name: 'Date Range Query (September 2024)',
                query: () => this.prismaService.test.findMany({
                    where: {
                        createdAt: {
                            gte: new Date('2024-09-01'),
                            lte: new Date('2024-09-30')
                        }
                    },
                    take: 100
                })
            }
        ];

        const results: Array<{ name: string; queryTime: number; resultCount: number }> = [];
        for (const { name, query } of queries) {
            const queryStart = Date.now();
            const result = await query();
            const queryTime = Date.now() - queryStart;
            
            results.push({
                name,
                queryTime,
                resultCount: Array.isArray(result) ? result.length : result
            });
        }

        const totalTime = Date.now() - startTime;

        return {
            individualQueries: results,
            totalTime,
            averageTime: results.reduce((sum, r) => sum + r.queryTime, 0) / results.length
        };
    }
}
