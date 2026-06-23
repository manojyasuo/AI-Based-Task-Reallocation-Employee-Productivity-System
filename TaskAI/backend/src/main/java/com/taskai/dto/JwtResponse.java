package com.taskai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @AllArgsConstructor
public class JwtResponse {
    private String token;
    private Long id;
    private String email;
    private String role;
}
