import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRoles } from 'src/enum/user-roles';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ enum: UserRoles, default: UserRoles.USER, isRequired: true })
  role?: UserRoles;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop([{ type: Types.ObjectId, ref: 'Post' }])
  posts: Types.ObjectId[];

  @Prop()
  refresh_token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
