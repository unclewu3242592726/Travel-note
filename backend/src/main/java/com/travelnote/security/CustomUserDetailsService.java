package com.travelnote.security;

import com.travelnote.entity.User;
import com.travelnote.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom UserDetailsService implementation
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserService userService;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmailOrMobile) throws UsernameNotFoundException {
        // Find user
        User user = userService.findByUsernameOrEmailOrMobile(usernameOrEmailOrMobile);
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username/email/mobile: " + usernameOrEmailOrMobile);
        }

        // 创建权限列表
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        if (user.getType() == 1) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        } else if (user.getType() == 2) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SADMIN"));
        }

        // 返回自定义的 CustomUserDetails
        return new CustomUserDetails(
                user.getId(),      // 用户ID
                user.getUsername(), // 用户名
                user.getPassword(), // 密码
                authorities        // 权限列表
        );
    }
} 