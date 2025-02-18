package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.entity.CommentLike;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.CommentLikeRepository;
import com.jgy36.PoliticalApp.repository.CommentRepository;
import com.jgy36.PoliticalApp.repository.PostRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;
    private final CommentLikeRepository commentLikeRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, PostRepository postRepository, NotificationService notificationService, CommentLikeRepository commentLikeRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.commentLikeRepository = commentLikeRepository;
    }

    public List<Comment> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return commentRepository.findByPost(post);
    }

    public Comment addComment(Long postId, String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        Comment comment = new Comment(content, user, post);
        Comment savedComment = commentRepository.save(comment);

        // Notify users who previously commented
        commentRepository.findByPost(post).stream()
                .filter(prevComment -> !prevComment.getUser().equals(user))
                .forEach(prevComment -> notificationService.createNotification(
                        prevComment.getUser(),
                        user.getUsername() + " also commented on a post you interacted with"
                ));

        // Detect Mentions and Notify Users
        Matcher matcher = Pattern.compile("@(\\w+)").matcher(content);
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

        CommentLike like = new CommentLike(user, comment);
        commentLikeRepository.save(like);

        if (!comment.getUser().equals(user))
            if (!comment.getUser().equals(user)) { // ✅ Ensure `getUser()` is correctly used
                User commentOwner = comment.getUser(); // ✅ Explicitly define the user
                notificationService.createNotification(
                        commentOwner,
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

        Comment reply = new Comment(content, user, parentComment.getPost());
        reply.setParentComment(parentComment);
        Comment savedReply = commentRepository.save(reply);

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
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found"));

        if (!comment.getUser().getEmail().equals(email) && !user.getRole().equals("ROLE_ADMIN")) {
            throw new AccessDeniedException("You are not allowed to delete this comment.");
        }

        commentRepository.delete(comment);
    }
}
