import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskComment, TaskCommentDocument } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(TaskComment.name)
    private commentModel: Model<TaskCommentDocument>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<TaskCommentDocument> {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      authorId: userId,
      taskId: createCommentDto.taskId,
    });
    return createdComment.save();
  }

  async findByTask(taskId: string): Promise<TaskCommentDocument[]> {
    return this.commentModel
      .find({ taskId })
      .populate('authorId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async remove(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId).exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentModel.deleteOne({ _id: commentId }).exec();
  }
}
