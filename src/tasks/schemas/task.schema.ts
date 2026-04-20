import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true, default: '' })
  description!: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.TODO,
  })
  status!: TaskStatus;

  // Прив'язка до проекту
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId!: Types.ObjectId;

  // Хто створив
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  creatorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigneeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  parentTaskId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: Date })
  deadline?: Date;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
  })
  location!: {
    type: string;
    coordinates: number[];
  };
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ title: 'text', description: 'text' });
TaskSchema.index({ location: '2dsphere' });
