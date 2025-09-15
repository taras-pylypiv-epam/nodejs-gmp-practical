import 'reflect-metadata';
import { container } from 'tsyringe';
import { DynamoStore } from '../stores/DynamoStore';
import { MentorRepository } from '../repositories/MentorRepository';
import { MentorService } from '../services/MentorService';
import { MentorController } from '../controllers/MentorController';
import { TimeSlotRepository } from '../repositories/TimeSlotRepository';
import { TimeSlotService } from '../services/TimeSlotService';

container.registerSingleton('IDynamoStore', DynamoStore);

container.register('IMentorRepository', MentorRepository);
container.register('IMentorService', MentorService);
container.register('IMentorController', MentorController);

container.register('ITimeSlotRepository', TimeSlotRepository);
container.register('ITimeSlotService', TimeSlotService);

export const diContainer = container;
