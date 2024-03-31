import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Res,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { Genre } from '@prisma/client';
import { Request, Response } from 'express';

@Controller({
  path: 'api/genres',
  version: '1',
})
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @UsePipes(ValidationPipe)
  @Post()
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() createGenreDto: CreateGenreDto
  ): Promise<Genre[] | Response> {
    const data = await this.genreService.createNew(createGenreDto);

    try {
      return res.status(HttpStatus.CREATED).json({
        status: HttpStatus.CREATED,
        message: 'Successfully created genre',
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: HttpStatus.BAD_REQUEST,
        message: `Error occurred while creating genre: ${error}`,
      });
    }
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<Genre[] | Response> {
    const data = await this.genreService.findAll();

    data.length === 0
      ? res.status(HttpStatus.NOT_FOUND).send({
          status: HttpStatus.NOT_FOUND,
          message: 'Not found, Cannot find genre',
        })
      : data;

    try {
      return res.status(HttpStatus.OK).json({
        status: HttpStatus.OK,
        message: 'Successfully get all genre',
        data: data,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: HttpStatus.BAD_REQUEST,
        message: `Error occured while showing all genres: ${error}`,
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.genreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genreService.update(+id, updateGenreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.genreService.remove(+id);
  }
}
