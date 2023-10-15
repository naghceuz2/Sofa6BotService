import 'module-alias/register';

import moduleAlias from 'module-alias';
import path from 'path';

moduleAlias.addAlias('@', path.resolve(__dirname, '../'));
