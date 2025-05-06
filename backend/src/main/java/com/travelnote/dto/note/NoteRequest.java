package com.travelnote.dto.note;

import com.travelnote.dto.noteMedia.NoteMediaDTO;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class NoteRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private String location;

    private String coverUrl;

    private List<NoteMediaDTO> media;

}