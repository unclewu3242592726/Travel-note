package com.travelnote.dto.user;

import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Data
public class UserProfileResponse {
    private String username;
    private String avatar;
    private String email;
    private String mobile;
    private String createTime;
    private String introduction;

}
