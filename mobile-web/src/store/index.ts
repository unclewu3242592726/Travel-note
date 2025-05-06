import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import noteFormReducer from './noteFormSlice';

// 配置持久化
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['noteForm'], // 只持久化noteForm reducer
};

const rootReducer = combineReducers({
  noteForm: noteFormReducer,
  // 可以在这里添加其他reducers
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 创建store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略redux-persist的action类型检查
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

// 创建persistor
export const persistor = persistStore(store);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;