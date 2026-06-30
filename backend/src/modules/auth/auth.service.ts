import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email déjà utilisé');

    const citoyenRole = await this.prisma.role.findUnique({ where: { nom: 'citoyen' } });
    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email,
        passwordHash: hash,
        telephone: dto.telephone,
        roleId: citoyenRole!.id,
      },
      include: { role: true },
    });

    const token = this.jwt.sign({ sub: user.id });
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });
    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    if (user.statut !== 'actif') throw new UnauthorizedException('Compte suspendu');

    const token = this.jwt.sign({ sub: user.id });
    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }
}
