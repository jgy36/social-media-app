package com.jgy36.PoliticalApp.service;

import com.jgy36.PoliticalApp.dto.PostDTO;
import com.jgy36.PoliticalApp.entity.Comment;
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
    private final HashtagService hashtagService;
    private final CommentRepository commentRepository;
    private final CommunityRepository communityRepository;
    private final HashtagRepository hashtagRepository;


    public PostService(PostRepository postRepository, UserRepository userRepository, HashtagService hashtagService, CommentRepository commentRepository, CommunityRepository communityRepository, HashtagRepository hashtagRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.hashtagService = hashtagService;
        this.commentRepository = commentRepository;
        this.communityRepository = communityRepository;
        this.hashtagRepository = hashtagRepository;
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

        // THIS IS THE MISSING PART - Extract and save hashtags
        extractAndSaveHashtags(post);

        return postRepository.save(post);
    }

    // Add this method to extract and save hashtags
    private void extractAndSaveHashtags(Post post) {
        // Extract hashtags from content using regex
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(post.getContent());

        Set<Hashtag> hashtags = new HashSet<>();

        while (matcher.find()) {
            String tagText = matcher.group(); // This includes the # symbol

            // Look up the hashtag or create a new one
            Hashtag hashtag = hashtagRepository.findByTag(tagText)
                    .orElseGet(() -> {
                        Hashtag newTag = new Hashtag(tagText);
                        return hashtagRepository.save(newTag);
                    });

            // If existing hashtag, increment its count
            if (hashtag.getId() != null) {
                hashtag.setCount(hashtag.getCount() + 1);
                hashtagRepository.save(hashtag);
            }

            // Associate hashtag with post
            hashtags.add(hashtag);
            post.addHashtag(hashtag);
        }

        // Log for debugging
        if (!hashtags.isEmpty()) {
            System.out.println("✅ Extracted " + hashtags.size() + " hashtags from post: " +
                    hashtags.stream().map(Hashtag::getTag).collect(Collectors.joining(", ")));
        }
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

    // ✅ Add a comment to a post
    public Comment addComment(Long postId, String username, String text) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));

        Comment comment = new Comment(text, user, post);
        return commentRepository.save(comment);
    }

    // ✅ Get all comments for a post
    public List<Comment> getPostComments(Long postId) {
        return commentRepository.findByPostId(postId);
    }

    // ✅ Save/Unsave a post
    public void toggleSavePost(Long postId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));

        if (user.getSavedPosts().contains(post)) {
            user.getSavedPosts().remove(post);
        } else {
            user.getSavedPosts().add(post);
        }
        userRepository.save(user);
    }

    // ✅ Get all saved posts for a user
    public List<Post> getSavedPosts(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));

        return List.copyOf(user.getSavedPosts());
    }

    // ✅ Fixed: Using distinct method name and correct parameter type
    public List<Post> getPostsByTag(String hashtag) {
        return hashtagService.getPostsByHashtag(hashtag);
    }

    // ✅ Get post by ID
    public Post getPostById(Long postId) {
        return postRepository.findByIdWithDetails(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found with ID: " + postId));
    }

    // ✅ Find posts by a specific user
    public List<Post> getPostsByUserId(Long userId) {
        return postRepository.findByAuthorId(userId);
    }

    // ✅ Create a post in a specific community
    public Post createCommunityPost(String content, String communityId) {
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

        // Initialize collections
        post.setLikes(new HashSet<>());
        post.setLikedUsers(new HashSet<>());
        post.setComments(new HashSet<>());

        // Here we would associate the post with a community
        // This depends on your data model and may require additional
        // fields in the Post entity and possibly a CommunityRepository

        return postRepository.save(post);
    }

    public List<Post> getPostsByCommunitySlug(String communitySlug) {
        return postRepository.findByCommunitySlugOrderByCreatedAtDesc(communitySlug);
    }

}
