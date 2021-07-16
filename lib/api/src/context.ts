import { createContext as ReactCreateContext } from 'react';
import type { Combo } from './index';

export const createContext = ({ api, state }: Combo) => ReactCreateContext({ api, state });
