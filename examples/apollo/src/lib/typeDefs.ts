import * as fs from 'fs';
import * as path from 'path';

const schemaFile = path.join(__dirname, 'schema.graphql');
export default fs.readFileSync(schemaFile, 'utf8') as any;
