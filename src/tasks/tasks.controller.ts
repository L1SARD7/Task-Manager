import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TaskStatus } from './schemas/task.schema';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized (401): Missing or invalid access token',
})
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create task' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks list with filters' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid filter query parameters',
  })
  findAll(@Query() filterDto: GetTasksFilterDto) {
    return this.tasksService.findAll(filterDto);
  }

  @Get('analytics/stats')
  @ApiOperation({ summary: 'Get user task statistics' })
  getStatistics(@CurrentUser('userId') userId: string) {
    return this.tasksService.getUserStatistics(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiNotFoundResponse({ description: 'Not Found (404): Task not found' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  @ApiNotFoundResponse({ description: 'Not Found (404): Task not found' })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid task status value',
  })
  @ApiNotFoundResponse({ description: 'Not Found (404): Task not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete task' })
  @ApiNotFoundResponse({ description: 'Not Found (404): Task not found' })
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
