import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class NewsTranslationContent {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: '' })
  excerpt: string;

  @Prop({ default: 'MSC WINNER' })
  badgeMsc: string;

  @Prop({ default: 'ASC WINNER' })
  badgeAsc: string;

  @Prop({ type: [String], default: [] })
  bullets: string[];
}

@Schema({ timestamps: true, collection: 'news_articles' })
export class NewsArticle {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: 'bg-slide.jpg' })
  thumbnailKey: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Date, default: null })
  publishedAt: Date | null;

  @Prop({ type: NewsTranslationContent, required: true })
  vi: NewsTranslationContent;

  @Prop({ type: NewsTranslationContent, required: true })
  en: NewsTranslationContent;
}

export type NewsArticleDocument = HydratedDocument<NewsArticle>;
export const NewsArticleSchema = SchemaFactory.createForClass(NewsArticle);
