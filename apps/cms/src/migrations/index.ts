import * as migration_20261104_110517_initial from './20261104_110517_initial';
import * as migration_20261105_103641_home_content from './20261105_103641_home_content';
import * as migration_20261105_122920_about_content from './20261105_122920_about_content';
import * as migration_20261109_104831_wave3_content from './20261109_104831_wave3_content';

export const migrations = [
  {
    up: migration_20261104_110517_initial.up,
    down: migration_20261104_110517_initial.down,
    name: '20261104_110517_initial',
  },
  {
    up: migration_20261105_103641_home_content.up,
    down: migration_20261105_103641_home_content.down,
    name: '20261105_103641_home_content',
  },
  {
    up: migration_20261105_122920_about_content.up,
    down: migration_20261105_122920_about_content.down,
    name: '20261105_122920_about_content',
  },
  {
    up: migration_20261109_104831_wave3_content.up,
    down: migration_20261109_104831_wave3_content.down,
    name: '20261109_104831_wave3_content'
  },
];
