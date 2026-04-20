import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

interface TaskAggregationResult {
  _id: string;
  count: number;
}

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) {}

  async create(
    createTaskDto: CreateTaskDto,
    userId: string,
  ): Promise<TaskDocument> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      creatorId: new Types.ObjectId(userId),
    });
    return createdTask.save();
  }

  async findAll(
    filterDto: GetTasksFilterDto,
  ): Promise<{ data: TaskDocument[]; total: number }> {
    const {
      projectId,
      status,
      assigneeId,
      tag,
      search,
      deadlineFrom,
      deadlineTo,
      sortBy,
      order,
      page,
      limit,
    } = filterDto;
    const query: Record<string, any> = {};

    if (projectId) query.projectId = new Types.ObjectId(projectId);
    if (status) query.status = status;
    if (assigneeId) query.assigneeId = new Types.ObjectId(assigneeId);
    if (tag) query.tags = tag;

    if (search) {
      query.$text = { $search: search };
    }

    if (deadlineFrom || deadlineTo) {
      const deadlineQuery: { $gte?: Date; $lte?: Date } = {};
      if (deadlineFrom) deadlineQuery.$gte = new Date(deadlineFrom);
      if (deadlineTo) deadlineQuery.$lte = new Date(deadlineTo);
      query.deadline = deadlineQuery;
    }

    const sortOptions: Record<string, 1 | -1> = {};
    if (sortBy) {
      sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    }

    const skip = (page! - 1) * limit!;

    const [data, total] = await Promise.all([
      this.taskModel
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit!)
        .exec(),
      this.taskModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<TaskDocument> {
    const task = await this.taskModel.findById(id).exec();
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, { $set: updateTaskDto }, { new: true })
      .exec();
    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }
    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskModel
      .deleteOne({ _id: new Types.ObjectId(id) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
  }

  async updateStatus(id: string, status: TaskStatus): Promise<TaskDocument> {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
    if (!updatedTask) {
      throw new NotFoundException('Task not found');
    }
    return updatedTask;
  }

  async getUserStatistics(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const stats = await this.taskModel
      .aggregate<TaskAggregationResult>([
        {
          $match: {
            $or: [{ creatorId: userObjectId }, { assigneeId: userObjectId }],
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ])
      .exec();

    const formattedStats = stats.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const total = stats.reduce((sum, curr) => sum + curr.count, 0);

    return {
      totalTasks: total,
      byStatus: formattedStats,
    };
  }
}
