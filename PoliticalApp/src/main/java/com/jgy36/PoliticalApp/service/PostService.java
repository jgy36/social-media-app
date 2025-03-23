package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Community;
import com.jgy36.PoliticalApp.entity.Hashtag;
import com.jgy36.PoliticalApp.entity.Post;
import com.jgy36.PoliticalApp.entity.User;
import com.jgy36.PoliticalApp.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HashtagRepository hashtagRepository;
    private final CommentRepository commentRepository;
    private final CommunityRepository communityRepository;
    private final PostLikeRepository postLikeRepository;

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            HashtagRepository hashtagRepository,
            CommentRepository commentRepository,
            CommunityRepository communityRepository,
            PostLikeRepository postLikeRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.hashtagRepository = hashtagRepository;
        this.commentRepository = commentRepository;
        this.communityRepository = communityRepository;
        this.postLikeRepository = postLikeRepository;
    }

    // ✅ Get all posts
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        return posts.stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ Get posts from users that the current user follows
    public List<PostDTO> getPostsFromFollowing(List<Long> followingIds) {
        List<Post> posts = postRepository.findPostsFromFollowing(followingIds);
        return posts.stream()
                .map(PostDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ Create a new post
    @Transactional
    public Post createPost(String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        Post post = new Post();
        post.setContent(content);
        post.setAuthor(user);
        post.setCreatedAt(LocalDateTime.now());

        // Extract and save hashtags
        Set<Hashtag> hashtags = extractHashtags(content);
        for (Hashtag hashtag : hashtags) {
            post.addHashtag(hashtag);
        }

        return postRepository.save(post);
    }

    // Method to extract hashtags from content
    private Set<Hashtag> extractHashtags(String content) {
        Set<Hashtag> hashtags = new HashSet<>();
        if (content == null || content.isEmpty()) {
            return hashtags;
        }

        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            String tagText = "#" + matcher.group(1); // Include the # symbol
            // Find or create hashtag
            Hashtag hashtag = hashtagRepository.findByTag(tagText)
                    .orElseGet(() -> {
                        Hashtag newHashtag = new Hashtag(tagText);
                        return hashtagRepository.save(newHashtag);
                    });

            // If it's an existing hashtag, increment the count
            if (hashtag.getId() != null) {
                hashtag.setCount(hashtag.getCount() + 1);
                hashtagRepository.save(hashtag);
            }

            hashtags.add(hashtag);
        }

        return hashtags;
    }

    // ✅ Delete a post (only the author can delete their post)
    @Transactional
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

        // Remove hashtag associations first (update hashtag counts)
        if (post.getHashtags() != null && !post.getHashtags().isEmpty()) {
            for (Hashtag hashtag : new HashSet<>(post.getHashtags())) {
                if (hashtag.getCount() > 0) {
                    hashtag.setCount(hashtag.getCount() - 1);
                    hashtagRepository.save(hashtag);
                }
                post.removeHashtag(hashtag);
            }
        }

        postRepository.delete(post);
    }

    // ✅ Like/Unlike a post
    @Transactional
    public int toggleLike(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));

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
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));

        return post.getLikedUsers().stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
    }

    // ✅ Save/Unsave a post
    @Transactional
    public void toggleSavePost(Long postId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));

        if (user.getSavedPosts() == null) {
            user.setSavedPosts(new HashSet<>());
        }

        if (user.getSavedPosts().contains(post)) {
            user.getSavedPosts().remove(post);
        } else {
            user.getSavedPosts().add(post);
        }

        userRepository.save(user);
    }

    // ✅ Get all saved posts for a user
    public List<Post> getSavedPosts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email));

        if (user.getSavedPosts() == null) {
            return Collections.emptyList();
        }

        return new ArrayList<>(user.getSavedPosts());
    }

    // ✅ Get posts by hashtag
    public List<Post> getPostsByTag(String tag) {
        // Ensure tag has # prefix
        String normalizedTag = tag.startsWith("#") ? tag : "#" + tag;

        // Try to find hashtag entity
        Optional<Hashtag> hashtagOpt = hashtagRepository.findByTag(normalizedTag);

        if (hashtagOpt.isPresent()) {
            // If hashtag exists, return its posts
            return new ArrayList<>(hashtagOpt.get().getPosts());
        } else {
            // Otherwise search for posts containing the hashtag text
            return postRepository.findByContentContainingIgnoreCase(normalizedTag);
        }
    }

    // ✅ Get a post by ID
    public Post getPostById(Long postId) {
        return postRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));
    }

    // ✅ Find posts by a specific user
    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    // ✅ Create a post in a specific community
    @Transactional
    public Post createCommunityPost(String communityId, String content) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Community community = communityRepository.findBySlug(communityId)
                .orElseThrow(() -> new IllegalArgumentException("Community not found"));

        // Check if user is a member of the community
        if (!community.isMember(user)) {
            throw new IllegalArgumentException("You must be a member of this community to post");
        }

        Post post = new Post();
        post.setContent(content);
        post.setAuthor(user);
        post.setCommunity(community);
        post.setCreatedAt(LocalDateTime.now());

        // Extract and save hashtags
        Set<Hashtag> hashtags = extractHashtags(content);
        for (Hashtag hashtag : hashtags) {
            post.addHashtag(hashtag);
        }

        return postRepository.save(post);
    }

    // Get posts by community slug
    public List<Post> getPostsByCommunitySlug(String slug) {
        return postRepository.findByCommunitySlugOrderByCreatedAtDesc(slug);
    }

    @Transactional(readOnly = true)
    public boolean isPostSavedByUser(Long postId, String email) {
        Optional<Post> postOpt = postRepository.findById(postId);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (postOpt.isEmpty() || userOpt.isEmpty()) {
            return false;
        }

        Post post = postOpt.get();
        User user = userOpt.get();

        // Check if this post is in the user's saved posts collection
        if (user.getSavedPosts() != null) {
            return user.getSavedPosts().stream()
                    .anyMatch(savedPost -> savedPost.getId().equals(postId));
        }

        return false;
    }
}


