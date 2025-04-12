package com.jgy36.PoliticalApp.dto;

// DTO for email verification
public class VerifyEmailRequest {
    private String code;

    public VerifyEmailRequest() {
    }

    public VerifyEmailRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
