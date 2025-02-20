package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Comment;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.PostLike;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.CommentRepository;
import com.jgy36.PoliticalApp.repository.PostLikeRepository;
import com.jgy36.PoliticalApp.repository.PostRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository, PostLikeRepository postLikeRepository, CommentRepository commentRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
        this.commentRepository = commentRepository;

    }

    // ✅ Get posts for "For You" tab (all posts sorted by newest first)
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(PostDTO::new) // ✅ Convert Post -> PostDTO
                .collect(Collectors.toList());
    }

    // ✅ Get posts for "Following" tab (only posts from users that the current user follows)
    public List<PostDTO> getPostsFromFollowing(List<Long> followingIds) {
        if (followingIds.isEmpty()) {
            return List.of(); // ✅ Return an empty list if user follows no one
        }

        List<Post> posts = postRepository.findPostsFromFollowing(followingIds);
        return posts.stream()
                .map(PostDTO::new) // ✅ Convert Post -> PostDTO
                .collect(Collectors.toList());
    }

    // ✅ Create a new post (Requires authentication)
    public Post createPost(String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOpt.get();
        Post post = new Post();
        post.setContent(content);
        post.setAuthor(user);
        post.setCreatedAt(java.time.LocalDateTime.now());

        return postRepository.save(post);
    }

    // ✅ Delete a post (only the author can delete their post)
    public void deletePost(Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOpt.get();
        Optional<Post> postOpt = postRepository.findById(postId);

        if (postOpt.isEmpty()) {
            throw new IllegalArgumentException("Post not found");
        }

        Post post = postOpt.get();

        if (!post.getAuthor().equals(user)) {
            throw new SecurityException("You are not allowed to delete this post.");
        }

        postRepository.delete(post);
    }

    // ✅ Like/Unlike a post
    public String likePost(Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        Optional<PostLike> existingLike = postLikeRepository.findByPostAndUser(post, user);

        if (existingLike.isPresent()) {
            postLikeRepository.deleteByPostAndUser(post, user);
            return "Post unliked successfully.";
        } else {
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            return "Post liked successfully.";
        }
    }

    // ✅ Add this method to retrieve posts by user ID
    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    // ✅ Fetch a post by ID
    public Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + postId));
    }

    // ✅ Like/Unlike a post
    public int toggleLike(Long postId, String email) { // ✅ Use email, not username
        User user = userRepository.findByEmail(email) // ✅ Search by email
                .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with ID: " + postId));

        if (post.getLikedUsers().contains(user)) {
            post.getLikedUsers().remove(user);
        } else {
            post.getLikedUsers().add(user);
        }

        postRepository.save(post);
        return post.getLikedUsers().size();
    }

    // ✅ Get users who liked a post
    public List<String> getPostLikes(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow();
        return post.getLikedUsers().stream().map(User::getUsername).collect(Collectors.toList());
    }

    // ✅ Add a comment to a post
    public Comment addComment(Long postId, String username, String text) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        Comment comment = new Comment(text, user, post);
        return commentRepository.save(comment);
    }

    // ✅ Get all comments for a post
    public List<Comment> getPostComments(Long postId) {
        return commentRepository.findByPostId(postId);
    }

    // ✅ Save/Unsave a post
    public void toggleSavePost(Long postId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();

        if (user.getSavedPosts().contains(post)) {
            user.getSavedPosts().remove(post);
        } else {
            user.getSavedPosts().add(post);
        }
        userRepository.save(user);
    }

    // ✅ Get all saved posts for a user
    public List<Post> getSavedPosts(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return List.copyOf(user.getSavedPosts());
    }

}
