import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { formatVndPrice, parseVndPrice } from '../common/format-vnd';
import { nextNumericId } from '../common/mongo-id';
import { parseLocale, type Locale } from '../common/locale';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
  size: string;
  price: string;
  priceVnd: number;
  date: string;
};

export type ProductResponse = {
  id: number;
  name: string;
  description: string;
  size: string;
  price: string;
  priceVnd: number;
  date: string;
  thumbnailKey: string;
  thumbnailUrl: string;
};

export type AdminProductResponse = {
  id: number;
  thumbnailKey: string;
  thumbnailUrl: string;
  sortOrder: number;
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
      size: translation.size,
      priceVnd,
      price: formatVndPrice(priceVnd, locale),
      date: translation.date,
    };
  }

  private toResponse(product: Product, locale: Locale): ProductResponse {
    const translation = this.mapTranslation(product[locale], locale);

    return {
      id: product.id,
      ...translation,
      thumbnailKey: product.thumbnailKey,
      thumbnailUrl: this.uploadsService.getPublicUrl(product.thumbnailKey),
    };
  }

  private toAdminResponse(product: Product): AdminProductResponse {
    return {
      id: product.id,
      thumbnailKey: product.thumbnailKey,
      thumbnailUrl: this.uploadsService.getPublicUrl(product.thumbnailKey),
      sortOrder: product.sortOrder,
      translations: {
        vi: product.vi ? this.mapTranslation(product.vi, 'vi') : null,
        en: product.en ? this.mapTranslation(product.en, 'en') : null,
      },
    };
  }

  private normalizeTranslation(
    data: CreateProductDto['vi'],
  ): ProductTranslationContent {
    return {
      name: data.name,
      description: data.description,
      size: data.size,
      priceVnd: data.priceVnd,
      date: data.date,
    };
  }

  async findAll(localeInput?: string): Promise<ProductResponse[]> {
    const locale = parseLocale(localeInput);
    const products = await this.productModel
      .find()
      .sort({ sortOrder: 1, id: 1 })
      .lean();

    return products.map((product) => this.toResponse(product, locale));
  }

  async findOne(id: number, localeInput?: string): Promise<ProductResponse> {
    const locale = parseLocale(localeInput);
    const product = await this.productModel.findOne({ id }).lean();

    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    return this.toResponse(product, locale);
  }

  async findAllAdmin(): Promise<AdminProductResponse[]> {
    const products = await this.productModel
      .find()
      .sort({ sortOrder: 1, id: 1 })
      .lean();

    return products.map((product) => this.toAdminResponse(product));
  }

  async findOneAdmin(id: number): Promise<AdminProductResponse> {
    const product = await this.productModel.findOne({ id }).lean();
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return this.toAdminResponse(product);
  }

  async create(dto: CreateProductDto): Promise<AdminProductResponse> {
    const id = await nextNumericId(this.productModel);
    const product = await this.productModel.create({
      id,
      thumbnailKey: dto.thumbnailKey ?? '',
      sortOrder: dto.sortOrder ?? 0,
      vi: this.normalizeTranslation(dto.vi),
      en: this.normalizeTranslation(dto.en),
    });

    return this.toAdminResponse(product.toObject());
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
    return this.toAdminResponse(product.toObject());
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
