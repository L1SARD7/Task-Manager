import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  @ApiConflictResponse({
    description: 'Conflict (409): User with this email already exists',
  })
  register(@Body() dto: AuthDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and return JWT token' })
  @ApiBadRequestResponse({
    description: 'Bad Request (400): Invalid request body or validation failed',
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized (401): Invalid email or password',
  })
  login(@Body() dto: AuthDto) {
    return this.authService.login(dto);
  }
}
