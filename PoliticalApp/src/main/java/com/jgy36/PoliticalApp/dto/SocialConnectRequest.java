package com.jgy36.PoliticalApp.dto;

// DTO for connecting social account
public class SocialConnectRequest {
    private String token;

    public SocialConnectRequest() {
    }

    public SocialConnectRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
