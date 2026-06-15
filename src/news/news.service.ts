import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nextNumericId } from '../common/mongo-id';
import { parseLocale, type Locale } from '../common/locale';
import { UploadsService } from '../uploads/uploads.service';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { NewsArticle, NewsArticleDocument } from './schemas/news-article.schema';

export type NewsArticleResponse = {
  id: number;
  slug: string;
  title: string;
  date: string;
  body: string;
  excerpt: string;
  badgeMsc: string;
  badgeAsc: string;
  bullets: string[];
  thumbnailKey: string;
  thumbnailUrl: string;
};

export type PaginatedNewsResponse = {
  data: NewsArticleResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminNewsResponse = {
  id: number;
  slug: string;
  thumbnailKey: string;
  thumbnailUrl: string;
  sortOrder: number;
  publishedAt: string | null;
  translations: {
    vi: {
      title: string;
      body: string;
      excerpt: string;
      badgeMsc: string;
      badgeAsc: string;
      bullets: string[];
    } | null;
    en: {
      title: string;
      body: string;
      excerpt: string;
      badgeMsc: string;
      badgeAsc: string;
      bullets: string[];
    } | null;
  };
};

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(NewsArticle.name)
    private readonly articleModel: Model<NewsArticleDocument>,
    private readonly uploadsService: UploadsService,
  ) {}

  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private toResponse(article: NewsArticle, locale: Locale): NewsArticleResponse {
    const translation = article[locale];

    return {
      id: article.id,
      slug: article.slug,
      title: translation.title,
      date: this.formatDate(article.publishedAt),
      body: translation.body,
      excerpt: translation.excerpt,
      badgeMsc: translation.badgeMsc,
      badgeAsc: translation.badgeAsc,
      bullets: translation.bullets,
      thumbnailKey: article.thumbnailKey,
      thumbnailUrl: this.uploadsService.getPublicUrl(article.thumbnailKey),
    };
  }

  private toAdminResponse(article: NewsArticle): AdminNewsResponse {
    return {
      id: article.id,
      slug: article.slug,
      thumbnailKey: article.thumbnailKey,
      thumbnailUrl: this.uploadsService.getPublicUrl(article.thumbnailKey),
      sortOrder: article.sortOrder,
      publishedAt: article.publishedAt?.toISOString() ?? null,
      translations: {
        vi: article.vi ?? null,
        en: article.en ?? null,
      },
    };
  }

  private publishedFilter() {
    return {
      publishedAt: { $ne: null, $lte: new Date() },
    };
  }

  async findAll(
    localeInput?: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedNewsResponse> {
    const locale = parseLocale(localeInput);
    const skip = (page - 1) * limit;
    const filter = this.publishedFilter();

    const [articles, total] = await Promise.all([
      this.articleModel
        .find(filter)
        .sort({ sortOrder: 1, id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.articleModel.countDocuments(filter),
    ]);

    return {
      data: articles.map((article) => this.toResponse(article, locale)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(
    id: number,
    localeInput?: string,
  ): Promise<NewsArticleResponse> {
    const locale = parseLocale(localeInput);
    const article = await this.articleModel
      .findOne({ id, ...this.publishedFilter() })
      .lean();

    if (!article) {
      throw new NotFoundException(`News article #${id} not found`);
    }

    return this.toResponse(article, locale);
  }

  async findAllAdmin(): Promise<AdminNewsResponse[]> {
    const articles = await this.articleModel
      .find()
      .sort({ sortOrder: 1, id: -1 })
      .lean();

    return articles.map((article) => this.toAdminResponse(article));
  }

  async findOneAdmin(id: number): Promise<AdminNewsResponse> {
    const article = await this.articleModel.findOne({ id }).lean();
    if (!article) {
      throw new NotFoundException(`News article #${id} not found`);
    }
    return this.toAdminResponse(article);
  }

  async create(dto: CreateNewsArticleDto): Promise<AdminNewsResponse> {
    const id = await nextNumericId(this.articleModel);

    try {
      const article = await this.articleModel.create({
        id,
        slug: dto.slug,
        thumbnailKey: dto.thumbnailKey ?? '',
        sortOrder: dto.sortOrder ?? 0,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        vi: dto.vi,
        en: dto.en,
      });

      return this.toAdminResponse(article.toObject());
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(`Slug "${dto.slug}" đã tồn tại`);
      }
      throw error;
    }
  }

  async update(
    id: number,
    dto: UpdateNewsArticleDto,
  ): Promise<AdminNewsResponse> {
    const article = await this.articleModel.findOne({ id });
    if (!article) {
      throw new NotFoundException(`News article #${id} not found`);
    }

    if (dto.slug !== undefined) article.slug = dto.slug;
    if (dto.thumbnailKey !== undefined) {
      this.uploadsService.replaceUploadedFile(
        article.thumbnailKey,
        dto.thumbnailKey,
      );
      article.thumbnailKey = dto.thumbnailKey;
    }
    if (dto.sortOrder !== undefined) article.sortOrder = dto.sortOrder;
    if (dto.publishedAt !== undefined) {
      article.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;
    }
    if (dto.vi) article.vi = { ...article.vi, ...dto.vi };
    if (dto.en) article.en = { ...article.en, ...dto.en };

    try {
      await article.save();
      return this.toAdminResponse(article.toObject());
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(`Slug "${dto.slug}" đã tồn tại`);
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: number }).code === 11000
    );
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const article = await this.articleModel.findOne({ id }).lean();
    if (!article) {
      throw new NotFoundException(`News article #${id} not found`);
    }

    this.uploadsService.deleteIfUploaded(article.thumbnailKey);

    await this.articleModel.deleteOne({ id });
    return { deleted: true };
  }
}
