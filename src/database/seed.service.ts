import { existsSync, readFileSync } from 'fs';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { join } from 'path';
import { parseVndPrice } from '../common/format-vnd';
import { NewsArticle, NewsArticleDocument } from '../news/schemas/news-article.schema';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { DEFAULT_GRID_BY_PRODUCT_ID } from '../products/product-grid-position';
import { Product, ProductDocument } from '../products/schemas/product.schema';

type Locale = 'vi' | 'en';

type ProductItem = {
  id: number;
  name: string;
  description: string;
  packing?: string;
  size: string;
  price: string;
  date: string;
};

type NewsArticleItem = {
  title: string;
  date: string;
  body: string;
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

const PRODUCT_CATEGORY_BY_ID: Record<number, string> = {
  1: 'other-cuts',
  2: 'other-cuts',
  3: 'other-cuts',
  4: 'fillets',
  5: 'other-cuts',
  6: 'other-cuts',
  7: 'other-cuts',
  8: 'fillets',
  9: 'whole-fish',
  10: 'other-cuts',
  11: 'fillets',
  12: 'other-cuts',
};

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(NewsArticle.name)
    private readonly articleModel: Model<NewsArticleDocument>,
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  onModuleInit() {
    void this.categoriesService
      .seedDefaultsIfEmpty()
      .then(() => this.cleanupLegacyNewsFields())
      .then(() => this.backfillProductCategories())
      .then(() => this.backfillProductGridPositions())
      .then(() => this.runSeedIfNeeded())
      .catch((error) => {
        this.logger.error('Seed failed', error);
      });
  }

  private async backfillProductCategories() {
    const defaultKey = await this.categoriesService.getDefaultKey();
    const products = await this.productModel.find().lean();

    for (const product of products) {
      if (product.categoryKey) continue;

      const categoryKey = PRODUCT_CATEGORY_BY_ID[product.id] ?? defaultKey;

      await this.productModel.updateOne(
        { id: product.id },
        { $set: { categoryKey } },
      );
    }
  }

  private async cleanupLegacyNewsFields() {
    const result = await this.articleModel.updateMany(
      {},
      {
        $unset: {
          'vi.badgeMsc': '',
          'vi.badgeAsc': '',
          'vi.bullets': '',
          'en.badgeMsc': '',
          'en.badgeAsc': '',
          'en.bullets': '',
        },
      },
    );

    if (result.modifiedCount > 0) {
      this.logger.log(
        `Removed legacy news fields from ${result.modifiedCount} article(s)`,
      );
    }
  }

  private async backfillProductGridPositions() {
    const products = await this.productModel.find().lean();

    for (const product of products) {
      if (product.gridPosition?.col && product.gridPosition?.row) continue;

      const gridPosition =
        DEFAULT_GRID_BY_PRODUCT_ID[product.id] ?? {
          col: 1,
          row: 1,
          tileSize: 'standard' as const,
        };

      await this.productModel.updateOne(
        { id: product.id },
        { $set: { gridPosition } },
      );
    }
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

    const defaultKey = await this.categoriesService.getDefaultKey();

    for (const [index, viItem] of vi.pages.products.items.entries()) {
      const enItem = en.pages.products.items[index];
      if (!enItem) continue;

      await this.productModel.create({
        id: viItem.id,
        thumbnailKey: PRODUCT_THUMBNAILS[viItem.id] ?? 'bg-slide.jpg',
        categoryKey: PRODUCT_CATEGORY_BY_ID[viItem.id] ?? defaultKey,
        sortOrder: index,
        gridPosition: DEFAULT_GRID_BY_PRODUCT_ID[viItem.id] ?? {
          col: 1,
          row: 1,
          tileSize: 'standard',
        },
        vi: {
          name: viItem.name,
          description: viItem.description,
          packing: viItem.packing ?? '',
          size: viItem.size,
          priceVnd: parseVndPrice(viItem.price),
          date: viItem.date,
        },
        en: {
          name: enItem.name,
          description: enItem.description,
          packing: enItem.packing ?? '',
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
        },
        en: {
          title: enArticle.title,
          body: enArticle.body,
          excerpt: enSectionItem?.excerpt ?? '',
        },
      });
    }
  }
}
