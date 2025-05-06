import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CustomUploadFile } from '../components/MediaEditor';
import type { RootState } from './index';

// 定义可序列化的文件对象结构
interface SerializableUploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  type?: string;
  size?: number;
  percent?: number;
  // 不包含 originFileObj
  response?: {
    data: {
      url: string;
    }
  };
}

// 定义笔记表单状态的类型
interface NoteFormState {
  title: string;
  content: string;
  location: string;
  fileList: SerializableUploadFile[];
  coverUrl: string;
  lastUpdated: number;
}

// 初始状态
const initialState: NoteFormState = {
  title: '',
  content: '',
  location: '',
  fileList: [],
  coverUrl: '',
  lastUpdated: Date.now(),
};

// 创建slice
const noteFormSlice = createSlice({
  name: 'noteForm',
  initialState,
  reducers: {
    // 更新表单字段
    updateFormField: (
      state, 
      action: PayloadAction<{field: keyof Pick<NoteFormState, 'title' | 'content' | 'location'>, value: string}>
    ) => {
      const { field, value } = action.payload;
      state[field] = value;
      state.lastUpdated = Date.now();
    },
    
    // 更新媒体文件
    updateMediaFiles: (
      state,
      action: PayloadAction<{fileList: CustomUploadFile[], coverUrl: string}>
    ) => {
      const { fileList, coverUrl } = action.payload;
      
      // 深度清理非序列化对象，确保所有文件对象都可序列化
      state.fileList = fileList.map(file => {
        // 创建一个新对象，只保留可序列化属性
        const serializableFile: SerializableUploadFile = {
          uid: file.uid,
          name: file.name,
          status: file.status,
          size: file.size,
          percent: file.percent,
          type: file.type,
          url: file.url
        };
        
        // 如果有response且有url，则保留
        if (file.response?.data?.url) {
          serializableFile.response = {
            data: {
              url: file.response.data.url
            }
          };
        }
        
        return serializableFile;
      });
      
      state.coverUrl = coverUrl;
      state.lastUpdated = Date.now();
    },
    
    // 清空表单数据
    clearFormData: (state) => {
      Object.assign(state, initialState);
      state.lastUpdated = Date.now();
    }
  },
});

// 导出actions
export const { updateFormField, updateMediaFiles, clearFormData } = noteFormSlice.actions;

// 导出选择器
export const selectNoteForm = (state: RootState) => state.noteForm;

export default noteFormSlice.reducer;