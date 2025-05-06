package com.travelnote.dto;

import lombok.Data;

import java.io.Serializable;

/**
 * Standard API response wrapper
 */
@Data
public class ResponseResult<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Response code
     */
    private Integer code;

    /**
     * Message
     */
    private String message;

    /**
     * Data
     */
    private T data;

    /**
     * Success response with data
     */
    public static <T> ResponseResult<T> success(T data) {
        ResponseResult<T> result = new ResponseResult<>();
        result.setCode(200);
        result.setMessage("Success");
        result.setData(data);
        return result;
    }

    /**
     * Success response without data
     */
    public static <T> ResponseResult<T> success() {
        ResponseResult<T> result = new ResponseResult<>();
        result.setCode(200);
        result.setMessage("Success");
        return result;
    }

    /**
     * Error response with message
     */
    public static <T> ResponseResult<T> error(String message) {
        ResponseResult<T> result = new ResponseResult<>();
        result.setCode(500);
        result.setMessage(message);
        return result;
    }

    /**
     * Error response with code and message
     */
    public static <T> ResponseResult<T> error(int code, String message) {
        ResponseResult<T> result = new ResponseResult<>();
        result.setCode(code);
        result.setMessage(message);
        return result;
    }

    /**
     * Error response with code, message and field name
     */
    public static <T> ResponseResult<T> error(int code, String message, String field) {
        ResponseResult<T> result = new ResponseResult<>();
        result.setCode(code);
        result.setMessage(message);
        result.setData((T) field); // 将字段名存储在data字段中
        return result;
    }
}