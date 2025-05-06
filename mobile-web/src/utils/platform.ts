import { Capacitor } from '@capacitor/core';

/**
 * 检查是否在移动端运行
 */
export const isMobile = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * 检查是否在Android平台运行
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * 检查是否在iOS平台运行
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * 检查是否在Web端运行
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === 'web';
};

/**
 * 获取当前运行平台名称
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};