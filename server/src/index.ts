import * as dotenv from 'dotenv';
import { setupNodeProcess } from './lifecycle/process';
import { startServer } from './server';
dotenv.config();

setupNodeProcess();
startServer();
