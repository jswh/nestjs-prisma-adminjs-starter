import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AdminModule } from '@adminjs/nestjs'
import * as AdminJSPrisma from '@adminjs/prisma'
import AdminJS from 'adminjs'
import { User } from '@prisma/client';
import { DMMFClass } from '@prisma/client/runtime';

AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
})

const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password',
}

const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN)
  }
  return null
}

@Module({
  imports: [
    AdminModule.createAdminAsync({
      useFactory: () => {
        const prisma = new PrismaService()
        // `_baseDmmf` contains necessary Model metadata but it is a private method
        // so it isn't included in PrismaClient type
        const dmmf = ((prisma as any)._baseDmmf as DMMFClass)
        return {
        adminJsOptions: {
          rootPath: '/admin',
          resources: [{
            resource: { model: dmmf.modelMap.User, client: prisma },
            options: {},
          }],
        },
        auth: {
          authenticate,
          cookieName: 'adminjs',
          cookiePassword: 'secret'
        },
        sessionOptions: {
          resave: true,
          saveUninitialized: true,
          secret: 'secret'
        },
      }},
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
