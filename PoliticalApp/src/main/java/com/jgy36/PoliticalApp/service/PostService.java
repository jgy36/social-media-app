package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.PostLike;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.PostLikeRepository;
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
    private final PostLikeRepository postLikeRepository;


    public PostService(PostRepository postRepository, UserRepository userRepository, PostLikeRepository postLikeRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;

    }

    /**
     * ✅ Get posts for "For You" tab (all posts sorted by newest first)
     */
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(PostDTO::new) // ✅ Convert Post -> PostDTO
                .collect(Collectors.toList());
    }


    /**
     * ✅ Get posts for "Following" tab (only posts from users that the current user follows)
     */
    public List<PostDTO> getPostsFromFollowing() {
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

        if (followingIds.isEmpty()) {
            return List.of(); // ✅ Return an empty list instead of null
        }

        List<Post> posts = postRepository.findPostsFromFollowing(followingIds);
        return posts.stream()
                .map(PostDTO::new) // ✅ Convert Post -> PostDTO
                .collect(Collectors.toList());
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
}
