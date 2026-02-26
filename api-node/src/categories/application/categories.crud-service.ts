import { BaseCrudService } from "src/db/application/base-crud.service";
import { Category } from "../domain/category.entity";
import { Inject, Injectable } from "@nestjs/common";
import { CATEGORIES_REPOSITORY } from "../domain/categories.repository.interface";
import { type CategoriesRepository } from "../domain/categories.repository.interface";

@Injectable()
export class CategoriesCrudService extends BaseCrudService<Category> {
  constructor(
    @Inject(CATEGORIES_REPOSITORY)
    private readonly categoriesRepository: CategoriesRepository,
  ) {
    super(categoriesRepository);
  }
}
