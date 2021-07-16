import { compileCsfModule } from '../lib/compiler';

export default (content: string) => compileCsfModule(JSON.parse(content));
