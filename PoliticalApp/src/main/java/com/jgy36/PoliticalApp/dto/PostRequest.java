package com.jgy36.PoliticalApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostRequest {
    private String content;
    private Long originalPostId; // ID of the original post (for reposts)
    private boolean isRepost = false;
    private Long communityId; // Optional community ID
}
