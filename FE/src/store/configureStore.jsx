import { configureStore } from '@reduxjs/toolkit';
import { createEpicMiddleware } from 'redux-observable';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootEpics from './epics';
import rootReducers from './reducers';

const persistConfig = {
  key: "root",
  storage,
  whitelist: ['auth'], 
};

const persistedReducer = persistReducer(persistConfig, rootReducers);

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, 
      thunk: false,             
    }).concat(epicMiddleware),
});

epicMiddleware.run(rootEpics);

export const persistor = persistStore(store);