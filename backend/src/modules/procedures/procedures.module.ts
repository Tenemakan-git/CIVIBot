import { Module } from '@nestjs/common';
import { ProceduresService } from './procedures.service';
import { ProceduresController, AdminProceduresController } from './procedures.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProceduresService],
  controllers: [ProceduresController, AdminProceduresController],
  exports: [ProceduresService],
})
export class ProceduresModule {}
