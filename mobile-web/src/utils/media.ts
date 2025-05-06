import axios from '../api/client';

/**
 * 媒体配置对象类型定义
 */
export interface MediaConfig {
  // MinIO服务器基础URL，用于构建完整URL
  minioBaseUrl: string;
  // API服务器基础URL，用于请求预签名URL
  apiBaseUrl: string;
  // 是否使用MinIO预签名URL（如果不使用，则通过API获取）
  usePreSignedUrl: boolean;
  // 预签名URL有效期（秒）
  urlExpiration: number;
  // 桶名，用于直接拼接URL时使用
  bucketName: string;
  // 默认占位图片URL
  defaultImageUrl: string;
  // URL缓存，用于缓存已经获取的URL
  urlCache: Map<string, { url: string; expiry: number }>;
}

/**
 * 配置对象
 */
export const mediaConfig: MediaConfig = {
  // MinIO服务器基础URL，用于构建完整URL
  minioBaseUrl: process.env.REACT_APP_MINIO_BASE_URL || 'http://localhost:9000',
  // API服务器基础URL
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  // 是否使用MinIO预签名URL（如果不使用，则通过API获取）
  usePreSignedUrl: process.env.REACT_APP_USE_PRESIGNED_URL === 'true',
  // 预签名URL有效期（秒）
  urlExpiration: 3600,
  // 桶名
  bucketName: process.env.REACT_APP_MINIO_BUCKET_NAME || 'travel-notes',
  // 默认占位图片URL
  defaultImageUrl: '/assets/default-image.jpg',
  // URL缓存，用于缓存已经获取的URL
  urlCache: new Map<string, { url: string; expiry: number }>(),
};

/**
 * 判断一个路径是否为相对路径（非完整URL）
 * @param path 路径字符串
 * @returns 是否为相对路径
 */
export const isRelativePath = (path: string | null | undefined): boolean => {
  if (!path) return false;
  
  // 清理路径
  const cleanPath = path.trim();
  if (cleanPath === '') return false;
  
  // 以斜杠开头但不是以双斜杠开头的路径被视为相对路径
  if (cleanPath.startsWith('/') && !cleanPath.startsWith('//')) {
    return true;
  }
  
  // 不包含协议和域名的路径被视为相对路径
  return !cleanPath.match(/^(https?:\/\/|\/\/)/i);
};

/**
 * 清理相对路径，确保格式一致
 * @param path 原始路径
 * @returns 清理后的路径
 */
export const cleanRelativePath = (path: string): string => {
  if (!path) return '';
  
  // 去除前导和尾随空格
  let cleanPath = path.trim();
  
  // 确保路径以斜杠开头
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }
  
  // 路径加前缀
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + mediaConfig.bucketName + cleanPath;
  } else if (!cleanPath.startsWith('/' + mediaConfig.bucketName)) {
    cleanPath = '/' + mediaConfig.bucketName + cleanPath;
  }
  
  return cleanPath;
};

/**
 * 获取完整的媒体URL
 * @param relativePath 相对路径
 * @param fallback 获取失败时的备用URL
 * @returns 完整URL的Promise
 */
export const getFullMediaUrl = async (
  relativePath: string | null | undefined, 
  fallback?: string
): Promise<string> => {
  // 处理空值或无效值
  if (!relativePath) {
    return fallback || mediaConfig.defaultImageUrl;
  }
  
  // 如果已经是完整URL，直接返回
  if (!isRelativePath(relativePath)) {
    return relativePath;
  }
  
  const cleanPath = cleanRelativePath(relativePath);
  
  // 检查缓存中是否有有效的URL
  const cachedItem = mediaConfig.urlCache.get(cleanPath);
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.url;
  }
  
  try {
    // 根据配置决定是直接拼接URL还是通过API获取
    if (!mediaConfig.usePreSignedUrl) {
      // 直接拼接基础URL和相对路径
      const fullUrl = `${mediaConfig.minioBaseUrl}${cleanPath}`;
      
      // 缓存URL，有效期为配置的时间
      mediaConfig.urlCache.set(cleanPath, {
        url: fullUrl,
        expiry: Date.now() + mediaConfig.urlExpiration * 1000
      });
      
      return fullUrl;
    } else {
      // 通过后端API获取预签名URL
      const response = await axios.get(`/api/upload/presigned-url`, {
        params: { path: cleanPath }
      });
      
      if (response.data && response.data.data) {
        const fullUrl = response.data.data;
        
        // 缓存URL，有效期为配置的时间（比实际预签名URL的有效期短一些以保证安全）
        mediaConfig.urlCache.set(cleanPath, {
          url: fullUrl,
          expiry: Date.now() + (mediaConfig.urlExpiration * 0.9) * 1000
        });
        
        return fullUrl;
      }
      
      throw new Error('Failed to get pre-signed URL');
    }
  } catch (error) {
    console.error(`Error getting full media URL for ${cleanPath}:`, error);
    
    // 提供更详细的错误日志
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
    }
    
    // 出错时，尝试返回备用URL，或者默认拼接的URL作为备选方案
    if (fallback) {
      return fallback;
    }
    
    return `${mediaConfig.minioBaseUrl}${cleanPath}`;
  }
};

/**
 * 同步获取媒体URL，如果缓存中有则返回，否则返回直接拼接的URL
 * 适用于UI渲染时需要立即显示的场景
 * @param relativePath 相对路径
 * @param fallback 备用URL
 * @returns 媒体URL字符串
 */
export const getMediaUrlSync = (
  relativePath: string | null | undefined,
  fallback?: string
): string => {
  // 处理空值
  if (!relativePath) {
    return fallback || mediaConfig.defaultImageUrl;
  }
  
  // 如果已经是完整URL，直接返回
  if (!isRelativePath(relativePath)) {
    return relativePath;
  }
  
  const cleanPath = cleanRelativePath(relativePath);
  
  // 检查缓存中是否有有效的URL
  const cachedItem = mediaConfig.urlCache.get(cleanPath);
  if (cachedItem && cachedItem.expiry > Date.now()) {
    return cachedItem.url;
  }
  
  // 缓存中没有，返回直接拼接的URL，并在后台异步获取正确的URL
  setTimeout(() => {
    // 在后台异步获取并更新缓存
    getFullMediaUrl(cleanPath).catch(console.error);
  }, 0);
  
  // 返回直接拼接的URL
  return `${mediaConfig.minioBaseUrl}${cleanPath}`;
};

/**
 * 获取多个媒体文件的完整URL
 * @param relativePaths 相对路径数组
 * @returns 完整URL数组的Promise
 */
export const getMultipleMediaUrls = async (
  relativePaths: (string | null | undefined)[]
): Promise<string[]> => {
  if (!relativePaths || relativePaths.length === 0) {
    return [];
  }
  
  // 过滤掉空值
  const validPaths = relativePaths.filter((path): path is string => 
    typeof path === 'string' && path.trim() !== ''
  );
  
  try {
    // 并行处理所有URL
    return await Promise.all(validPaths.map(path => getFullMediaUrl(path)));
  } catch (error) {
    console.error('Error getting multiple media URLs:', error);
    
    // 出错时返回基础URL拼接的路径作为备选方案
    return validPaths.map(path => {
      if (!isRelativePath(path)) return path;
      return `${mediaConfig.minioBaseUrl}${cleanRelativePath(path)}`;
    });
  }
};

/**
 * 同步获取多个媒体文件的URL（优先从缓存获取）
 * @param relativePaths 相对路径数组
 * @returns URL数组
 */
export const getMultipleMediaUrlsSync = (
  relativePaths: (string | null | undefined)[]
): string[] => {
  if (!relativePaths || relativePaths.length === 0) {
    return [];
  }
  
  // 过滤掉空值
  const validPaths = relativePaths.filter((path): path is string => 
    typeof path === 'string' && path.trim() !== ''
  );
  
  // 同步获取所有URL
  const urls = validPaths.map(path => getMediaUrlSync(path));
  
  // 在后台异步预获取完整URLs
  setTimeout(() => {
    getMultipleMediaUrls(validPaths).catch(console.error);
  }, 0);
  
  return urls;
};

/**
 * 从relativePath中提取文件名
 * @param path 相对路径
 * @returns 文件名
 */
export const getFileNameFromPath = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // 移除查询参数
  const pathWithoutQuery = path.split('?')[0];
  
  // 获取最后一个斜杠后的部分
  const parts = pathWithoutQuery.split('/');
  return parts[parts.length - 1];
};

/**
 * 设置媒体配置
 * @param config 配置对象
 */
export const setMediaConfig = (config: Partial<MediaConfig>): void => {
  Object.assign(mediaConfig, config);
};

/**
 * 预热缓存，提前加载常用资源的URL
 * @param paths 需要预热的相对路径数组
 */
export const preloadMediaUrls = (paths: string[]): void => {
  if (!paths || paths.length === 0) return;
  
  Promise.all(paths.map(path => getFullMediaUrl(path)))
    .catch(error => console.error('Error preloading media URLs:', error));
};

/**
 * 清除URL缓存
 * @param path 指定要清除的路径，如果不传则清除所有
 */
export const clearUrlCache = (path?: string): void => {
  if (path) {
    mediaConfig.urlCache.delete(cleanRelativePath(path));
  } else {
    mediaConfig.urlCache.clear();
  }
};