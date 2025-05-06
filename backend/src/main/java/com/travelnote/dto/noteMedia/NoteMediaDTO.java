package com.travelnote.dto.noteMedia;

import lombok.Data;

@Data
public  class NoteMediaDTO {
    private String url;
    private Integer type; // 0 图片，1 视频
    private Integer ordering;
}
