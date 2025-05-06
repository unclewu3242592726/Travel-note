package com.travelnote.exception;

/**
 * 账户状态异常（如被封禁、未激活等）
 */
public class AccountStatusException extends RuntimeException {
    
    private final int statusCode;
    
    public AccountStatusException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
}