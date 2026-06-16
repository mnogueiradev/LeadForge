import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IContactRepository } from './repositories/contacts.repository.interface';
import { PrismaContactRepository } from './repositories/prisma-contacts.repository';
import { ContactsController } from './controllers/contacts.controller';
import { CreateContactUseCase } from './usecases/create-contact.usecase';
import { UpdateContactUseCase } from './usecases/update-contact.usecase';
import { ArchiveContactUseCase } from './usecases/archive-contact.usecase';
import { DeleteContactUseCase } from './usecases/delete-contact.usecase';
import { GetContactUseCase } from './usecases/get-contact.usecase';
import { ListContactsUseCase } from './usecases/list-contacts.usecase';
import { ChangeContactOwnerUseCase } from './usecases/change-owner.usecase';

@Module({
  controllers: [ContactsController],
  providers: [
    { provide: PrismaClient, useFactory: () => new PrismaClient({ log: ['error', 'warn'] }) },
    { provide: IContactRepository, useClass: PrismaContactRepository },
    CreateContactUseCase,
    UpdateContactUseCase,
    ArchiveContactUseCase,
    DeleteContactUseCase,
    GetContactUseCase,
    ListContactsUseCase,
    ChangeContactOwnerUseCase
  ],
  exports: [IContactRepository],
})
export class ContactsModule {}
