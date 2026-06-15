import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'contact_messages' })
export class ContactMessage {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  address: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  newsletter: boolean;

  createdAt?: Date;
}

export type ContactMessageDocument = HydratedDocument<ContactMessage>;
export const ContactMessageSchema =
  SchemaFactory.createForClass(ContactMessage);
