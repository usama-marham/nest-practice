import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { TestService, TestQueryParams } from './test.service';

@Controller('test')
export class TestController {
    constructor(private testService: TestService) {}

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('sortBy') sortBy?: 'createdAt' | 'data',
        @Query('sortOrder') sortOrder?: 'asc' | 'desc'
    ) {
        const params: TestQueryParams = {
            page: page ? parseInt(page) : undefined,
            limit: limit ? parseInt(limit) : undefined,
            search,
            startDate,
            endDate,
            sortBy,
            sortOrder
        };

        return this.testService.findAll(params);
    }

    @Get('stats')
    async getStats() {
        return this.testService.getStats();
    }

    @Get('performance')
    async getPerformanceMetrics() {
        return this.testService.getPerformanceMetrics();
    }

    @Get('search')
    async searchByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('limit') limit?: string
    ) {
        const limitNum = limit ? parseInt(limit) : 100;
        return this.testService.searchByDateRange(startDate, endDate, limitNum);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.testService.findById(id);
    }

    @Get('search/text')
    async searchByText(
        @Query('q') query: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string
    ) {
        const params: TestQueryParams = {
            search: query,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20
        };

        return this.testService.findAll(params);
    }

    @Get('search/date-range')
    async searchByDateRangeDetailed(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('sortBy') sortBy?: 'createdAt' | 'data',
        @Query('sortOrder') sortOrder?: 'asc' | 'desc'
    ) {
        const params: TestQueryParams = {
            startDate,
            endDate,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 20,
            sortBy,
            sortOrder
        };

        return this.testService.findAll(params);
    }
}
