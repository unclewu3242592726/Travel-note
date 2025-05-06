import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// 导入 Swiper 相关组件和样式
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, Zoom } from 'swiper/modules';
// 导入 Swiper 类型
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface MediaItem {
  url: string;
  type: number; // 0: 图片, 1: 视频
}

interface NoteMediaCarouselProps {
  media: MediaItem[];
  mediaUrls: string[];
  onFullScreen: (index: number) => void;
  currentIndex: number;
  onIndexChange: (idx: number) => void;
}

const NoteMediaCarousel: React.FC<NoteMediaCarouselProps> = ({ media, mediaUrls, onFullScreen, currentIndex, onIndexChange }) => {
  // 自定义导航按钮
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);

  return (
    <Box sx={{ width: '100%', position: 'relative', bgcolor: '#000', height: 320, overflow: 'hidden' }}>
      <Swiper
        onSwiper={setSwiperRef}
        modules={[Navigation, Pagination, Autoplay, Zoom]}
        spaceBetween={0}
        slidesPerView={1}
        initialSlide={currentIndex}
        pagination={{ clickable: true }}
        zoom={true}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        onSlideChange={(swiper: SwiperType) => onIndexChange(swiper.activeIndex)}
        style={{ width: '100%', height: '100%' }}
      >
        {media.map((item, index) => (
          <SwiperSlide key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="swiper-zoom-container">
              {item.type === 0 ? (
                <img
                  src={mediaUrls[index] || item.url}
                  alt={`media-${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                  onClick={() => onFullScreen(index)}
                />
              ) : (
                <video
                  src={mediaUrls[index] || item.url}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', cursor: 'pointer' }}
                  onClick={() => onFullScreen(index)}
                  autoPlay
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 自定义导航按钮 */}
      {media.length > 1 && (
        <>
          <IconButton 
            onClick={() => swiperRef?.slidePrev()}
            sx={{ 
              position: 'absolute', 
              left: 8, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              bgcolor: 'rgba(255,255,255,0.3)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' },
              zIndex: 2
            }}
            size="small"
          >
            <ArrowBackIosNewIcon fontSize="small" sx={{ color: '#fff' }} />
          </IconButton>
          
          <IconButton 
            onClick={() => swiperRef?.slideNext()}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              bgcolor: 'rgba(255,255,255,0.3)', 
              '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' },
              zIndex: 2
            }}
            size="small"
          >
            <ArrowForwardIosIcon fontSize="small" sx={{ color: '#fff' }} />
          </IconButton>
        </>
      )}
      
      {/* 计数器指示器 */}
      <Box sx={{ 
        position: 'absolute', 
        bottom: 8, 
        right: 8, 
        textAlign: 'center', 
        color: '#fff', 
        fontSize: 14,
        bgcolor: 'rgba(0,0,0,0.5)',
        padding: '2px 8px',
        borderRadius: 1,
        zIndex: 2
      }}>
        {media.length > 1 && `${currentIndex + 1} / ${media.length}`}
      </Box>
    </Box>
  );
};

export default NoteMediaCarousel;
