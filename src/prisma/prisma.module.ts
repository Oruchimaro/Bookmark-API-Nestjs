import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // make this module globaly available 
// make sure that this module is imported at app.module
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
