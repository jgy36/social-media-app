package com.jgy36.PoliticalApp.dto;

// DTO for verifying 2FA code
public class VerifyTwoFaRequest {
    private String code;
    private String secret;

    public VerifyTwoFaRequest() {
    }

    public VerifyTwoFaRequest(String code, String secret) {
        this.code = code;
        this.secret = secret;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }
}
