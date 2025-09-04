import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    //default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'Something went wrong in the server';
    let type = `https://httpstatuses.com/${status}`;

    //1- Handle Nest's built-in HttpExceptions (NotFoundException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        detail = response;
        title = HttpStatus[status] ?? title;
      } else if (typeof response === 'object' && response !== null) {
        const r: any = response;
        detail = r.message ?? detail;
        title = r.error ?? HttpStatus[status] ?? title;
      }

      type = `https://httpstatuses.com/${status}`;
    }

    //2- Handle Prisma Errors (map to Http status codes)
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': //unique constraint failed
          status = HttpStatus.CONFLICT;
          title = 'Conflict';
          detail = `Duplictae value for field(s): ${exception.meta?.target}`;
          break;

        case 'P2025': // record not found
          status = HttpStatus.NOT_FOUND;
          title = 'Not Found';
          detail = `The requested resource does not exist`;
          break;

        case 'P2003': // foreign key constraint
          status = HttpStatus.BAD_REQUEST;
          title = 'Bad Request';
          detail = `Foreign key constraint failed`;
          break;

        default:
          status = HttpStatus.BAD_REQUEST;
          title = 'Database Error';
          detail = exception.message.replace(/\n/g, ' ');
      }
      type = `https://httpstatuses.com/${status}`;
    }

    //3- Handle validation or other generic errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      title = 'Validation Error';
      detail = 'Invalid input data for teh database query';
      type = `https://httpstatuses.com/${status}`;
    }

    //4- Anything else falls back to 500
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      title = 'Internal Server Error';
      detail = (exception as any)?.message ?? detail;
      type = `https://httpstatuses.com/${status}`;
    }

    //Optimal Logging
    this.logger.error(
      `[${status}] ${title} - ${detail}`,
      (exception as any)?.stack || '',
    );

    //Send  RFC 9457  (Problem Details) style response
    res.status(status).json({
      type,
      title,
      status,
      detail,
      instance: ctx.getRequest<Request>().url, //the URL that caused the error
      timestamp: new Date().toISOString(),
    });
  }
}
