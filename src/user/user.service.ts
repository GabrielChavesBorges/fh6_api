import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  create(createUserInput: CreateUserInput): Promise<User> {
    const user = this.userRepository.create(createUserInput);
    return this.userRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User ${id} not found.`);
    }
    return user;
  }

  async update(updateUserInput: UpdateUserInput) {
    const { id, ...changes } = updateUserInput;
    await this.userRepository.update(id, changes);
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const userToDelete = await this.userRepository.findOneBy({ id });
    if (!userToDelete) {
      throw new NotFoundException(`User ${id} not found.`);
    }
    await this.userRepository.remove(userToDelete);
    return true;
  }
}
