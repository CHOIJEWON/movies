import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    if (!(exception instanceof HttpException)) {
      exception = new InternalServerErrorException();
    }

    const response: any = (exception as HttpException).getResponse();
    const status = (exception as HttpException).getStatus();

    const log = {
      status,
      timestamp: new Date(),
      url: req.url,
      response: response?.['message'] ? response?.['message'] : response,
    };

    Logger.log(log);

    res.status(status).json(log);
  }
}
