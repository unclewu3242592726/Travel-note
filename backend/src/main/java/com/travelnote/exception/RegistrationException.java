package com.travelnote.exception;

/**
 * 用户注册异常
 */
public class RegistrationException extends RuntimeException {
    
    private final String field;
    
    public RegistrationException(String message) {
        super(message);
        this.field = null;
    }
    
    public RegistrationException(String message, String field) {
        super(message);
        this.field = field;
    }
    
    public String getField() {
        return field;
    }
}