import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized (401): Missing or invalid access token',
})
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user projects' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.projectsService.findAllUserProjects(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiNotFoundResponse({ description: 'Not Found (404): Project not found' })
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.projectsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  @ApiNotFoundResponse({ description: 'Not Found (404): Project not found' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete project' })
  @ApiNotFoundResponse({ description: 'Not Found (404): Project not found' })
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.projectsService.remove(id, userId);
  }
}
