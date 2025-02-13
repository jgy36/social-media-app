package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.entity.CommentLike;
import com.jgy36.PoliticalApp.entity.Politician;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.CommentLikeRepository;
import com.jgy36.PoliticalApp.repository.CommentRepository;
import com.jgy36.PoliticalApp.repository.PoliticianRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PoliticianRepository politicianRepository;
    private final NotificationService notificationService; // ✅ Add this
    private final CommentLikeRepository commentLikeRepository; // ✅ Add this


    public CommentService(CommentRepository commentRepository, UserRepository userRepository, PoliticianRepository politicianRepository, NotificationService notificationService, CommentLikeRepository commentLikeRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.politicianRepository = politicianRepository;
        this.notificationService = notificationService; // ✅ Inject it properly
        this.commentLikeRepository = commentLikeRepository; // ✅ Assign it properly


    }

    public List<Comment> getCommentsByPolitician(Long politicianId) {
        Optional<Politician> politician = politicianRepository.findById(politicianId);
        return politician.map(commentRepository::findByPolitician).orElseThrow(() -> new IllegalArgumentException("Politician not found"));
    }

    public Comment addComment(Long politicianId, String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Politician politician = politicianRepository.findById(politicianId)
                .orElseThrow(() -> new IllegalArgumentException("Politician not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPolitician(politician);
        comment.setContent(content);

        Comment savedComment = commentRepository.save(comment);

        // ✅ Notify all users who have commented before
        List<Comment> previousComments = commentRepository.findByPolitician(politician);
        for (Comment prevComment : previousComments) {
            if (!prevComment.getUser().equals(user)) {
                notificationService.createNotification(
                        prevComment.getUser(),
                        user.getUsername() + " also commented on " + politician.getName()
                );
            }
        }

        // ✅ Detect Mentions and Notify Users
        Pattern mentionPattern = Pattern.compile("@(\\w+)");
        Matcher matcher = mentionPattern.matcher(content);
        while (matcher.find()) {
            String mentionedUsername = matcher.group(1);
            userRepository.findByUsername(mentionedUsername).ifPresent(mentionedUser ->
                    notificationService.createNotification(
                            mentionedUser,
                            user.getUsername() + " mentioned you in a comment: \"" + content + "\""
                    )
            );
        }

        return savedComment;
    }

    public void likeComment(Long commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (commentLikeRepository.existsByUserAndComment(user, comment)) {
            throw new IllegalArgumentException("You already liked this comment.");
        }

        CommentLike like = new CommentLike();
        like.setUser(user);
        like.setComment(comment);
        commentLikeRepository.save(like);

        // ✅ Notify comment owner
        if (!comment.getUser().equals(user)) {
            notificationService.createNotification(
                    comment.getUser(),
                    user.getUsername() + " liked your comment: \"" + comment.getContent() + "\""
            );
        }
    }

    public Comment replyToComment(Long parentCommentId, String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new IllegalArgumentException("Parent comment not found"));

        Comment reply = new Comment();
        reply.setUser(user);
        reply.setParentComment(parentComment);
        reply.setContent(content);

        Comment savedReply = commentRepository.save(reply);

        // ✅ Notify original commenter
        if (!parentComment.getUser().equals(user)) {
            notificationService.createNotification(
                    parentComment.getUser(),
                    user.getUsername() + " replied to your comment: \"" + content + "\""
            );
        }

        return savedReply;
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
