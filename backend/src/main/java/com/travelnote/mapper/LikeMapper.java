package com.travelnote.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travelnote.entity.Like;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LikeMapper extends BaseMapper<Like> {
}