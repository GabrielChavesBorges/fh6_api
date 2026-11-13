import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { Manufacturer } from './manufacturer/manufacturer.entity';
import { ManufacturerModule } from './manufacturer/manufacturer.module';
import { formatError } from './common/graphql/format-error';
import { Car } from './car/car.entity';
import { CarModule } from './car/car.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: true,
      autoSchemaFile: true,
      sortSchema: true,
      formatError,
    }),
    TypeOrmModule.forRoot({
      type: 'mariadb',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Manufacturer, Car],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    }),
    ManufacturerModule,
    CarModule,
  ],
  providers: [AppService],
})
export class AppModule {}
