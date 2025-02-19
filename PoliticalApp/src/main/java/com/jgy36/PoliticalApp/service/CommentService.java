package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.entity.CommentLike;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.CommentLikeRepository;
import com.jgy36.PoliticalApp.repository.CommentRepository;
import com.jgy36.PoliticalApp.repository.PostRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final NotificationService notificationService;
    private final CommentLikeRepository commentLikeRepository;

    public CommentService(CommentRepository commentRepository, UserRepository userRepository, PostRepository postRepository,
                          NotificationService notificationService, CommentLikeRepository commentLikeRepository) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.notificationService = notificationService;
        this.commentLikeRepository = commentLikeRepository;
    }

    // ✅ Fetch all comments for a given post
    @Transactional(readOnly = true)
    public List<Comment> getCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + postId));

        return commentRepository.findByPost(post);
    }

    // ✅ Add a new comment to a post
    @Transactional
    public Comment addComment(Long postId, String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + auth.getName()));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + postId));

        Comment comment = new Comment(content, user, post);
        Comment savedComment = commentRepository.save(comment);

        // ✅ Notify users who previously commented
        commentRepository.findByPost(post).stream()
                .filter(prevComment -> !prevComment.getUser().equals(user))
                .forEach(prevComment -> notificationService.createNotification(
                        prevComment.getUser(),
                        user.getUsername() + " also commented on a post you interacted with"
                ));

        // ✅ Detect Mentions and Notify Users
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

    // ✅ Like a comment
    @Transactional
    public void likeComment(Long commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found"));

        if (commentLikeRepository.existsByUserAndComment(user, comment)) {
            throw new IllegalArgumentException("You already liked this comment.");
        }

        CommentLike like = new CommentLike(user, comment);
        commentLikeRepository.save(like);

        // ✅ Notify comment owner
        if (!comment.getUser().equals(user)) {
            notificationService.createNotification(
                    comment.getUser(),
                    user.getUsername() + " liked your comment: \"" + comment.getContent() + "\""
            );
        }
    }

    // ✅ Reply to a comment
    @Transactional
    public Comment replyToComment(Long parentCommentId, String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new NoSuchElementException("Parent comment not found"));

        Comment reply = new Comment(content, user, parentComment.getPost());
        reply.setParentComment(parentComment);
        return commentRepository.save(reply);
    }

    // ✅ Delete a comment
    @Transactional
    public void deleteComment(Long commentId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NoSuchElementException("Comment not found"));

        // ✅ Only allow deletion if the user is the owner or an admin
        if (!comment.getUser().equals(user) && !user.getRole().equals("ROLE_ADMIN")) {
            throw new SecurityException("You are not allowed to delete this comment.");
        }

        commentRepository.delete(comment);
    }
}
