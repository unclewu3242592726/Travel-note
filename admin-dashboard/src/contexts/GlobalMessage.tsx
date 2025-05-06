// GlobalMessage.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { message } from 'antd';

let messageApiRef: ReturnType<typeof message.useMessage>[0];

export const setGlobalMessageApi = (api: typeof messageApiRef) => {
  messageApiRef = api;
};

export const globalMessage = {
  success: (content: string) => messageApiRef?.success({ content }),
  error: (content: string) => messageApiRef?.error({ content }),
  info: (content: string) => messageApiRef?.info({ content }),
  warning: (content: string) => messageApiRef?.warning({ content }),
};