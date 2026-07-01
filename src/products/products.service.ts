import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { formatVndPrice, parseVndPrice } from '../common/format-vnd';
import { nextNumericId } from '../common/mongo-id';
import { parseLocale, type Locale } from '../common/locale';
import { ProductCategoriesService } from '../product-categories/product-categories.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  DEFAULT_PRODUCT_GRID_POSITION,
  normalizeGridPosition,
  type ProductGridPosition,
} from './product-grid-position';
import {
  Product,
  ProductDocument,
  ProductTranslationContent,
} from './schemas/product.schema';

type TranslationLike = ProductTranslationContent & {
  price?: string;
};

export type ProductTranslationResponse = {
  name: string;
  description: string;
  packing: string;
  size: string;
  price: string;
  priceVnd: number;
  date: string;
};

export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  packing: string;
  size: string;
  price: string;
  priceVnd: number;
  date: string;
  categoryKey: string;
  categoryName: string;
  thumbnailKey: string;
  thumbnailUrl: string;
  gridPosition: ProductGridPosition;
};

export type AdminProductResponse = {
  id: number;
  categoryKey: string;
  categoryName: string;
  thumbnailKey: string;
  thumbnailUrl: string;
  sortOrder: number;
  gridPosition: ProductGridPosition;
  translations: {
    vi: ProductTranslationResponse | null;
    en: ProductTranslationResponse | null;
  };
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    private readonly uploadsService: UploadsService,
    private readonly categoriesService: ProductCategoriesService,
  ) {}

  private getPriceVnd(translation: TranslationLike): number {
    if (translation.priceVnd != null && translation.priceVnd > 0) {
      return translation.priceVnd;
    }
    if (typeof translation.price === 'string') {
      return parseVndPrice(translation.price);
    }
    return 0;
  }

  private mapTranslation(
    translation: TranslationLike,
    locale: Locale,
  ): ProductTranslationResponse {
    const priceVnd = this.getPriceVnd(translation);

    return {
      name: translation.name,
      description: translation.description,
      packing: translation.packing ?? '',
      size: translation.size,
      priceVnd,
      price: formatVndPrice(priceVnd, locale),
      date: translation.date,
    };
  }

  private toResponse(
    product: Product,
    locale: Locale,
    categoryLabels: Map<string, string>,
  ): ProductResponse {
    const translation = this.mapTranslation(product[locale], locale);
    const categoryKey = product.categoryKey ?? '';

    return {
      id: product.id,
      ...translation,
      categoryKey,
      categoryName: categoryLabels.get(categoryKey) ?? categoryKey,
      thumbnailKey: product.thumbnailKey,
      thumbnailUrl: this.uploadsService.getPublicUrl(product.thumbnailKey),
      gridPosition: normalizeGridPosition(product.gridPosition),
    };
  }

  private toAdminResponse(
    product: Product,
    categoryLabels: Map<string, string>,
  ): AdminProductResponse {
    const categoryKey = product.categoryKey ?? '';

    return {
      id: product.id,
      categoryKey,
      categoryName: categoryLabels.get(categoryKey) ?? categoryKey,
      thumbnailKey: product.thumbnailKey,
      thumbnailUrl: this.uploadsService.getPublicUrl(product.thumbnailKey),
      sortOrder: product.sortOrder,
      gridPosition: normalizeGridPosition(product.gridPosition),
      translations: {
        vi: product.vi ? this.mapTranslation(product.vi, 'vi') : null,
        en: product.en ? this.mapTranslation(product.en, 'en') : null,
      },
    };
  }

  private normalizeGridPosition(
    data?: CreateProductDto['gridPosition'],
  ): ProductGridPosition {
    if (!data) return { ...DEFAULT_PRODUCT_GRID_POSITION };
    return normalizeGridPosition({
      col: data.col,
      row: data.row,
      tileSize: data.tileSize,
    });
  }

  private normalizeTranslation(
    data: CreateProductDto['vi'],
  ): ProductTranslationContent {
    return {
      name: data.name,
      description: data.description,
      packing: data.packing ?? '',
      size: data.size,
      priceVnd: data.priceVnd,
      date: data.date,
    };
  }

  async findAll(localeInput?: string): Promise<ProductResponse[]> {
    const locale = parseLocale(localeInput);
    const [products, categoryLabels] = await Promise.all([
      this.productModel.find().sort({ sortOrder: 1, id: 1 }).lean(),
      this.categoriesService.getLabelsMap(locale),
    ]);

    return products.map((product) =>
      this.toResponse(product, locale, categoryLabels),
    );
  }

  async findOne(id: number, localeInput?: string): Promise<ProductResponse> {
    const locale = parseLocale(localeInput);
    const [product, categoryLabels] = await Promise.all([
      this.productModel.findOne({ id }).lean(),
      this.categoriesService.getLabelsMap(locale),
    ]);

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return this.toResponse(product, locale, categoryLabels);
  }

  async findAllAdmin(): Promise<AdminProductResponse[]> {
    const [products, categoryLabels] = await Promise.all([
      this.productModel.find().sort({ sortOrder: 1, id: 1 }).lean(),
      this.categoriesService.getLabelsMap('vi'),
    ]);

    return products.map((product) =>
      this.toAdminResponse(product, categoryLabels),
    );
  }

  async findOneAdmin(id: number): Promise<AdminProductResponse> {
    const [product, categoryLabels] = await Promise.all([
      this.productModel.findOne({ id }).lean(),
      this.categoriesService.getLabelsMap('vi'),
    ]);

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return this.toAdminResponse(product, categoryLabels);
  }

  async create(dto: CreateProductDto): Promise<AdminProductResponse> {
    const categoryKey =
      dto.categoryKey?.trim() || (await this.categoriesService.getDefaultKey());
    await this.categoriesService.assertExists(categoryKey);

    const id = await nextNumericId(this.productModel);
    const product = await this.productModel.create({
      id,
      thumbnailKey: dto.thumbnailKey ?? '',
      categoryKey,
      sortOrder: dto.sortOrder ?? 0,
      gridPosition: this.normalizeGridPosition(dto.gridPosition),
      vi: this.normalizeTranslation(dto.vi),
      en: this.normalizeTranslation(dto.en),
    });

    const categoryLabels = await this.categoriesService.getLabelsMap('vi');
    return this.toAdminResponse(product.toObject(), categoryLabels);
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<AdminProductResponse> {
    const product = await this.productModel.findOne({ id });
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    if (dto.thumbnailKey !== undefined) {
      this.uploadsService.replaceUploadedFile(
        product.thumbnailKey,
        dto.thumbnailKey,
      );
      product.thumbnailKey = dto.thumbnailKey;
    }
    if (dto.sortOrder !== undefined) product.sortOrder = dto.sortOrder;
    if (dto.categoryKey !== undefined) {
      await this.categoriesService.assertExists(dto.categoryKey);
      product.categoryKey = dto.categoryKey;
    }
    if (dto.gridPosition !== undefined) {
      product.gridPosition = normalizeGridPosition({
        col: dto.gridPosition.col ?? product.gridPosition?.col,
        row: dto.gridPosition.row ?? product.gridPosition?.row,
        tileSize: dto.gridPosition.tileSize ?? product.gridPosition?.tileSize,
      });
    }
    if (dto.vi) {
      product.vi = {
        ...product.vi,
        ...dto.vi,
        priceVnd: dto.vi.priceVnd ?? product.vi.priceVnd,
      };
    }
    if (dto.en) {
      product.en = {
        ...product.en,
        ...dto.en,
        priceVnd: dto.en.priceVnd ?? product.en.priceVnd,
      };
    }

    await product.save();
    const categoryLabels = await this.categoriesService.getLabelsMap('vi');
    return this.toAdminResponse(product.toObject(), categoryLabels);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const product = await this.productModel.findOne({ id }).lean();
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    this.uploadsService.deleteIfUploaded(product.thumbnailKey);

    await this.productModel.deleteOne({ id });
    return { deleted: true };
  }
}
