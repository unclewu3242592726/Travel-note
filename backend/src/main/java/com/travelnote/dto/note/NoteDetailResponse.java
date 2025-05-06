package com.travelnote.dto.note;

import java.util.List;

import com.travelnote.dto.noteMedia.NoteMediaDTO;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class NoteDetailResponse extends NoteResponse {

   private List<NoteMediaDTO> media;
    // 其他字段和方法
}
