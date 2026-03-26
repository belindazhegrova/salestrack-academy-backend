import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'SalesTrack Academy Backend is running';
  }
}
