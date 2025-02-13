package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.PostRepository;
import com.jgy36.PoliticalApp.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    /**
     * ✅ Get posts for "For You" tab (all posts sorted by newest first)
     */
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * ✅ Get posts for "Following" tab (only posts from users that the current user follows)
     */
    public List<Post> getPostsFromFollowing() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        User user = userOpt.get();
        List<Long> followingIds = user.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toList());

        // If user follows no one, return an empty list
        if (followingIds.isEmpty()) {
            return List.of();
        }

        return postRepository.findPostsFromFollowing(followingIds);
    }

    /**
     * ✅ Create a new post (Requires authentication)
     */
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

    /**
     * ✅ Delete a post (only the author can delete their post)
     */
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
}
