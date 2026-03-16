import { combineEpics } from 'redux-observable';
import authEpic from './Auth/authEpic';

const rootEpic = combineEpics(
    ...authEpic,
);

export default rootEpic;