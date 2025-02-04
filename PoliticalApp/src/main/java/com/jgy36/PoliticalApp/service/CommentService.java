package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.CommentRepository;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PoliticianRepository politicianRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, PoliticianRepository politicianRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.politicianRepository = politicianRepository;
    }

    public List<Comment> getCommentsByPolitician(Long politicianId) {
        Optional<Politician> politician = politicianRepository.findById(politicianId);
        return politician.map(commentRepository::findByPolitician).orElseThrow(() -> new IllegalArgumentException("Politician not found"));
    }

    public Comment addComment(Long politicianId, String content) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));

        Politician politician = politicianRepository.findById(politicianId)
                .orElseThrow(() -> new IllegalArgumentException("Politician not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPolitician(politician);
        comment.setContent(content);

        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        // Only allow deletion by Admin or the user who wrote the comment
        if (!comment.getUser().getEmail().equals(email) && !user.getRole().equals("ROLE_ADMIN")) {
            throw new AccessDeniedException("You are not allowed to delete this comment.");
        }

        commentRepository.delete(comment);
    }
}
