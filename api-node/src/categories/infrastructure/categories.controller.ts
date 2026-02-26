import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { type Category } from '../domain/category.entity';
import { CategoriesCrudService } from '../application/categories.crud-service';
import { type DeepPartial } from 'src/db/domain/base.repository.interface';

@Controller('categories')
export class CategoriesController {
  constructor(protected readonly service: CategoriesCrudService) {}

  @Post()
  create(@Body() dto: Category) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: DeepPartial<Category>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

}
