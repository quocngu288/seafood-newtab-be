import { existsSync, readFileSync } from 'fs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
import { parseVndPrice } from '../common/format-vnd';
import { NewsArticle, NewsArticleDocument } from '../news/schemas/news-article.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

type Locale = 'vi' | 'en';

type ProductItem = {
  id: number;
  name: string;
  description: string;
  size: string;
  price: string;
  date: string;
};

type NewsArticleItem = {
  title: string;
  date: string;
  body: string;
  badgeMsc: string;
  badgeAsc: string;
  bullets: string[];
};

type MessagesFile = {
  pages: {
    products: { items: ProductItem[] };
    news: { articles: NewsArticleItem[] };
  };
  sections: {
    news: {
      items: Array<{ title: string; date: string; excerpt: string }>;
    };
  };
};

const PRODUCT_THUMBNAILS: Record<number, string> = {
  1: 'bg-slide.jpg',
  2: 'bg-slide1.jpg',
  3: 'bg-slide2.jpg',
  4: 'vungnuoi.jpg',
  5: 'certs/cert-left.jpg',
  6: 'certs/cert-middle.jpg',
  7: 'certs/cert-right.jpg',
  8: 'bg-slide1.jpg',
  9: 'bg-slide2.jpg',
  10: 'vungnuoi.jpg',
  11: 'certs/cert-middle.jpg',
  12: 'certs/cert-right.jpg',
};

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(NewsArticle.name)
    private readonly articleModel: Model<NewsArticleDocument>,
  ) {}

  onModuleInit() {
    void this.runSeedIfNeeded().catch((error) => {
      this.logger.error('Seed failed', error);
    });
  }

  private async runSeedIfNeeded() {
    const productCount = await this.productModel.countDocuments();
    if (productCount > 0) {
      this.logger.log('Database already seeded, skipping');
      return;
    }

    if (!this.canLoadSeedData()) {
      this.logger.warn(
        'Seed data not found — skipping. Add data via CMS or deploy with seed-data bundled.',
      );
      return;
    }

    await this.seedProducts();
    await this.seedNews();
    this.logger.log('Database seeded successfully');
  }

  private canLoadSeedData(): boolean {
    return this.resolveMessagesPath('vi') !== null;
  }

  /** Bundled seed (Railway) → monorepo frontend path (local dev) */
  private resolveMessagesPath(locale: Locale): string | null {
    const candidates = [
      join(__dirname, 'seed-data', `${locale}.json`),
      join(process.cwd(), 'src', 'database', 'seed-data', `${locale}.json`),
      join(
        process.cwd(),
        '..',
        'frontend',
        'src',
        'messages',
        `${locale}.json`,
      ),
    ];

    return candidates.find((path) => existsSync(path)) ?? null;
  }

  private loadMessages(locale: Locale): MessagesFile {
    const filePath = this.resolveMessagesPath(locale);
    if (!filePath) {
      throw new Error(`Seed messages not found for locale: ${locale}`);
    }

    return JSON.parse(readFileSync(filePath, 'utf-8')) as MessagesFile;
  }

  private parseDate(dateStr: string): Date | null {
    const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  private slugify(title: string, index: number): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60);

    return `${base || 'article'}-${index + 1}`;
  }

  private async seedProducts() {
    const vi = this.loadMessages('vi');
    const en = this.loadMessages('en');

    for (const [index, viItem] of vi.pages.products.items.entries()) {
      const enItem = en.pages.products.items[index];
      if (!enItem) continue;

      await this.productModel.create({
        id: viItem.id,
        thumbnailKey: PRODUCT_THUMBNAILS[viItem.id] ?? 'bg-slide.jpg',
        sortOrder: index,
        vi: {
          name: viItem.name,
          description: viItem.description,
          size: viItem.size,
          priceVnd: parseVndPrice(viItem.price),
          date: viItem.date,
        },
        en: {
          name: enItem.name,
          description: enItem.description,
          size: enItem.size,
          priceVnd: parseVndPrice(enItem.price),
          date: enItem.date,
        },
      });
    }
  }

  private async seedNews() {
    const vi = this.loadMessages('vi');
    const en = this.loadMessages('en');

    for (const [index, viArticle] of vi.pages.news.articles.entries()) {
      const enArticle = en.pages.news.articles[index];
      const sectionItem = vi.sections.news.items[index];
      const enSectionItem = en.sections.news.items[index];
      if (!enArticle) continue;

      await this.articleModel.create({
        id: index + 1,
        slug: this.slugify(viArticle.title, index),
        thumbnailKey: '',
        sortOrder: index,
        publishedAt: this.parseDate(viArticle.date),
        vi: {
          title: viArticle.title,
          body: viArticle.body,
          excerpt: sectionItem?.excerpt ?? '',
          badgeMsc: viArticle.badgeMsc,
          badgeAsc: viArticle.badgeAsc,
          bullets: viArticle.bullets,
        },
        en: {
          title: enArticle.title,
          body: enArticle.body,
          excerpt: enSectionItem?.excerpt ?? '',
          badgeMsc: enArticle.badgeMsc,
          badgeAsc: enArticle.badgeAsc,
          bullets: enArticle.bullets,
        },
      });
    }
  }
}
