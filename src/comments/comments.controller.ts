import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
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

@ApiTags('Comments')
@ApiBearerAuth()
@ApiUnauthorizedResponse({
  description: 'Unauthorized (401): Missing or invalid access token',
})
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  @ApiNotFoundResponse({
    description: 'Not Found (404): Task not found for provided taskId',
  })
  create(
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.commentsService.create(createCommentDto, userId);
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Get comments by task' })
  @ApiNotFoundResponse({ description: 'Not Found (404): Task not found' })
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(taskId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete comment' })
  @ApiNotFoundResponse({ description: 'Not Found (404): Comment not found' })
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.commentsService.remove(id, userId);
  }
}
