import tasks from './tasks';

module.exports = (on: Cypress.PluginEvents) => on('task', tasks);
