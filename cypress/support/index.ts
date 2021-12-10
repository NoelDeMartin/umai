import { installChaiPlugin } from '@noeldemartin/solid-utils';
import installCustomCommands from '@cy/support/commands';

require('cypress-plugin-tab');

installChaiPlugin();
installCustomCommands();
