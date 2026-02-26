import BaseModel from '../domain/base.entity';
import { type BaseRepository, DeepPartial } from '../domain/base.repository.interface';

import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseCrudService<T extends BaseModel> {
  constructor(private readonly repository: BaseRepository<BaseModel>) {}

  create(dto: DeepPartial<T>) {
    return this.repository.save(dto);
  }

  findAll() {
    return this.repository.find();
  }

  findOne(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  update(id: string, dto: DeepPartial<T>) {
    return this.repository.update({ id }, dto);
  }

  remove(id: string) {
    return this.repository.delete({ id });
  }
}
