import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nextNumericId } from '../common/mongo-id';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import {
  ContactMessage,
  ContactMessageDocument,
} from './schemas/contact-message.schema';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ContactMessage.name)
    private readonly messageModel: Model<ContactMessageDocument>,
  ) {}

  async create(dto: CreateContactMessageDto) {
    const id = await nextNumericId(this.messageModel);
    const saved = await this.messageModel.create({
      id,
      fullName: dto.fullName,
      phone: dto.phone,
      email: dto.email,
      address: dto.address ?? '',
      message: dto.message,
      newsletter: dto.newsletter ?? false,
    });

    return {
      id: saved.id,
      message: 'Contact message received successfully',
      createdAt: saved.createdAt,
    };
  }

  async findAllAdmin() {
    const messages = await this.messageModel
      .find()
      .sort({ createdAt: -1 })
      .lean();

    return messages.map((message) => ({
      id: message.id,
      fullName: message.fullName,
      phone: message.phone,
      email: message.email,
      address: message.address,
      message: message.message,
      newsletter: message.newsletter,
      createdAt: message.createdAt,
    }));
  }

  async findOneAdmin(id: number) {
    const message = await this.messageModel.findOne({ id }).lean();
    if (!message) {
      throw new NotFoundException(`Contact message #${id} not found`);
    }
    return {
      id: message.id,
      fullName: message.fullName,
      phone: message.phone,
      email: message.email,
      address: message.address,
      message: message.message,
      newsletter: message.newsletter,
      createdAt: message.createdAt,
    };
  }

  async removeAdmin(id: number) {
    const result = await this.messageModel.deleteOne({ id });
    if (!result.deletedCount) {
      throw new NotFoundException(`Contact message #${id} not found`);
    }
    return { deleted: true };
  }
}
