package com.travelnote.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.travelnote.dto.comment.CommentResponse;
import com.travelnote.entity.Comment;
import com.travelnote.entity.User;
import com.travelnote.mapper.CommentMapper;
import com.travelnote.mapper.UserMapper;
import com.travelnote.service.CommentService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentMapper commentMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    public List<CommentResponse> getCommentsByNoteId(Long noteId) {
        List<Comment> comments = commentMapper.selectList(
                new QueryWrapper<Comment>()
                        .eq("note_id", noteId)
                        .eq("deleted", 0)
                        .orderByDesc("create_time")
        );
        return comments.stream().map(comment -> {
            CommentResponse resp = new CommentResponse();
            BeanUtils.copyProperties(comment, resp);
            User user = userMapper.selectById(comment.getUserId());
            if (user != null) {
                resp.setUsername(user.getUsername());
                resp.setAvatar(user.getAvatar());
            }
            resp.setCreateTime(comment.getCreateTime().toString());
            return resp;
        }).collect(Collectors.toList());
    }

    @Override
    public void addComment(Long userId, Long noteId, String content) {
        User user = userMapper.selectById(userId);
        Comment comment = new Comment();
        comment.setNoteId(noteId);
        comment.setUserId(userId);
        comment.setContent(content);
        comment.setParentId(0L);
        comment.setCreateTime(LocalDateTime.now());
        comment.setUpdateTime(LocalDateTime.now());
        comment.setDeleted(0);
        commentMapper.insert(comment);
    }
}
