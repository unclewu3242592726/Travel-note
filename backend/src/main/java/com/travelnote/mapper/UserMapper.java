package com.travelnote.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.travelnote.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * User Mapper
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * Find user by username
     *
     * @param username username
     * @return User
     */
    @Select("SELECT * FROM user WHERE username = #{username} AND deleted = 0")
    User findByUsername(@Param("username") String username);

    /**
     * Find user by email
     *
     * @param email email
     * @return User
     */
    @Select("SELECT * FROM user WHERE email = #{email} AND deleted = 0")
    User findByEmail(@Param("email") String email);

    /**
     * Find user by mobile
     *
     * @param mobile mobile
     * @return User
     */
    @Select("SELECT * FROM user WHERE mobile = #{mobile} AND deleted = 0")
    User findByMobile(@Param("mobile") String mobile);
} 