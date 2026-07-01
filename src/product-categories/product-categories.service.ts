import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { slugifyTitle } from '../common/slugify';
import { nextNumericId } from '../common/mongo-id';
import { parseLocale, type Locale } from '../common/locale';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import {
  ProductCategory,
  ProductCategoryDocument,
} from './schemas/product-category.schema';

export type ProductCategoryResponse = {
  key: string;
  name: string;
  sortOrder: number;
};

export type AdminProductCategoryResponse = {
  id: number;
  key: string;
  sortOrder: number;
  translations: {
    vi: { name: string };
    en: { name: string };
  };
};

const DEFAULT_CATEGORIES: Array<{
  key: string;
  sortOrder: number;
  vi: string;
  en: string;
}> = [
  { key: 'fillets', sortOrder: 0, vi: 'Fillet', en: 'Fillets' },
  { key: 'whole-fish', sortOrder: 1, vi: 'Cá nguyên con', en: 'Whole Fish' },
  {
    key: 'other-cuts',
    sortOrder: 2,
    vi: 'Các phần cắt khác',
    en: 'Other Cuts',
  },
];

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectModel(ProductCategory.name)
    private readonly categoryModel: Model<ProductCategoryDocument>,
  ) {}

  async seedDefaultsIfEmpty(): Promise<void> {
    const count = await this.categoryModel.countDocuments();
    if (count > 0) return;

    for (const [index, item] of DEFAULT_CATEGORIES.entries()) {
      await this.categoryModel.create({
        id: index + 1,
        key: item.key,
        sortOrder: item.sortOrder,
        vi: { name: item.vi },
        en: { name: item.en },
      });
    }
  }

  private toPublic(category: ProductCategory, locale: Locale): ProductCategoryResponse {
    return {
      key: category.key,
      name: category[locale].name,
      sortOrder: category.sortOrder,
    };
  }

  private toAdmin(category: ProductCategory): AdminProductCategoryResponse {
    return {
      id: category.id,
      key: category.key,
      sortOrder: category.sortOrder,
      translations: {
        vi: { name: category.vi.name },
        en: { name: category.en.name },
      },
    };
  }

  private async resolveUniqueKey(
    preferred: string,
    excludeId?: number,
  ): Promise<string> {
    let base = slugifyTitle(preferred);
    if (!base) base = 'category';

    let candidate = base;
    let suffix = 2;

    while (await this.keyExists(candidate, excludeId)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private async keyExists(key: string, excludeId?: number): Promise<boolean> {
    const existing = await this.categoryModel.findOne({ key }).lean();
    if (!existing) return false;
    if (excludeId != null && existing.id === excludeId) return false;
    return true;
  }

  async findAll(localeInput?: string): Promise<ProductCategoryResponse[]> {
    const locale = parseLocale(localeInput);
    const categories = await this.categoryModel
      .find()
      .sort({ sortOrder: 1, id: 1 })
      .lean();

    return categories.map((category) => this.toPublic(category, locale));
  }

  async findAllAdmin(): Promise<AdminProductCategoryResponse[]> {
    const categories = await this.categoryModel
      .find()
      .sort({ sortOrder: 1, id: 1 })
      .lean();

    return categories.map((category) => this.toAdmin(category));
  }

  async findOneAdmin(id: number): Promise<AdminProductCategoryResponse> {
    const category = await this.categoryModel.findOne({ id }).lean();
    if (!category) {
      throw new NotFoundException(`Product category #${id} not found`);
    }
    return this.toAdmin(category);
  }

  async getLabel(key: string, locale: Locale): Promise<string> {
    const category = await this.categoryModel.findOne({ key }).lean();
    return category?.[locale]?.name ?? key;
  }

  async getLabelsMap(locale: Locale): Promise<Map<string, string>> {
    const categories = await this.categoryModel.find().lean();
    return new Map(
      categories.map((category) => [category.key, category[locale].name]),
    );
  }

  async assertExists(key: string): Promise<void> {
    const exists = await this.categoryModel.exists({ key });
    if (!exists) {
      throw new BadRequestException(`Unknown product category: ${key}`);
    }
  }

  async getDefaultKey(): Promise<string> {
    const first = await this.categoryModel
      .findOne()
      .sort({ sortOrder: 1, id: 1 })
      .lean();
    return first?.key ?? 'other-cuts';
  }

  async create(
    dto: CreateProductCategoryDto,
  ): Promise<AdminProductCategoryResponse> {
    const id = await nextNumericId(this.categoryModel);
    const key =
      dto.key?.trim() ||
      (await this.resolveUniqueKey(dto.en.name || dto.vi.name));

    if (await this.keyExists(key)) {
      throw new ConflictException(`Category key "${key}" already exists`);
    }

    const category = await this.categoryModel.create({
      id,
      key,
      sortOrder: dto.sortOrder ?? id - 1,
      vi: { name: dto.vi.name },
      en: { name: dto.en.name },
    });

    return this.toAdmin(category.toObject());
  }

  async update(
    id: number,
    dto: UpdateProductCategoryDto,
  ): Promise<AdminProductCategoryResponse> {
    const category = await this.categoryModel.findOne({ id });
    if (!category) {
      throw new NotFoundException(`Product category #${id} not found`);
    }

    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;
    if (dto.vi?.name) category.vi = { name: dto.vi.name };
    if (dto.en?.name) category.en = { name: dto.en.name };

    await category.save();
    return this.toAdmin(category.toObject());
  }

  async remove(id: number, productCount: number): Promise<{ deleted: true }> {
    const category = await this.categoryModel.findOne({ id }).lean();
    if (!category) {
      throw new NotFoundException(`Product category #${id} not found`);
    }

    if (productCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${category.key}" — ${productCount} product(s) still use it`,
      );
    }

    await this.categoryModel.deleteOne({ id });
    return { deleted: true };
  }
}
