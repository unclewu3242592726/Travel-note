import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { isMobile } from './platform';

/**
 * 从相机或相册获取图片
 * @param source 图片来源：'camera' 相机, 'photos' 相册, 'prompt' 提示用户选择
 * @returns 返回图片数据
 */
export const getPhoto = async (source: 'camera' | 'photos' | 'prompt' = 'prompt'): Promise<Photo | null> => {
  try {
    // 如果在原生移动端运行，使用Capacitor Camera插件
    if (isMobile()) {
      let cameraSource = CameraSource.Prompt;
      
      if (source === 'camera') {
        cameraSource = CameraSource.Camera;
      } else if (source === 'photos') {
        cameraSource = CameraSource.Photos;
      }
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: cameraSource,
        saveToGallery: false,
      });
      
      return image;
    } 
    // 在Web端运行，使用标准的文件选择器
    else {
      return null; // Web环境下，使用标准的文件上传控件
    }
  } catch (error) {
    console.error('获取照片失败', error);
    return null;
  }
};

/**
 * 将Capacitor照片数据转换为File对象
 * @param photo Capacitor Photo对象
 * @returns File对象
 */
export const photoToFile = async (photo: Photo): Promise<File | null> => {
  if (!photo || !photo.webPath) return null;
  
  try {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    
    return new File(
      [blob], 
      `photo_${Date.now()}.${photo.format || 'jpeg'}`,
      { type: `image/${photo.format}` }
    );
  } catch (error) {
    console.error('照片转换失败', error);
    return null;
  }
};