import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    const createdProject = new this.projectModel({
      ...createProjectDto,
      ownerId: new Types.ObjectId(userId),
    });
    return createdProject.save();
  }

  async findAllUserProjects(userId: string): Promise<ProjectDocument[]> {
    const userObjectId = new Types.ObjectId(userId);
    return this.projectModel
      .find({
        $or: [{ ownerId: userObjectId }, { memberIds: userObjectId }],
      })
      .exec();
  }

  async findOne(projectId: string, userId: string): Promise<ProjectDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const project = await this.projectModel
      .findOne({
        _id: new Types.ObjectId(projectId),
        $or: [{ ownerId: userObjectId }, { memberIds: userObjectId }],
      })
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found or access denied');
    }

    return project;
  }

  async update(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectDocument> {
    const userObjectId = new Types.ObjectId(userId);
    const project = await this.projectModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(projectId),
          ownerId: userObjectId,
        },
        { $set: updateProjectDto },
        { new: true },
      )
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found or you are not the owner');
    }

    return project;
  }

  async remove(projectId: string, userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const result = await this.projectModel
      .deleteOne({
        _id: new Types.ObjectId(projectId),
        ownerId: userObjectId,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found or you are not the owner');
    }
  }
}
