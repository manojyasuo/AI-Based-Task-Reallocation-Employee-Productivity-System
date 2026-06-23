package com.taskai.controller;

import com.taskai.dto.JwtResponse;
import com.taskai.dto.LoginRequest;
import com.taskai.repository.UserRepository;
import com.taskai.security.JwtUtils;
import com.taskai.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getUsername(), 
                                                 role));
    }

    @PostMapping("/register")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String password = data.get("password");
        
        return userRepository.findByEmail(email).map(user -> {
            if (user.isRegistered()) {
                 return ResponseEntity.status(400).body(Map.of("message", "User already registered. Please login."));
            }
            user.setPassword(passwordEncoder.encode(password));
            user.setRegistered(true);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Registration successful. You can now login."));
        }).orElse(ResponseEntity.status(404).body(Map.of("message", "Email not found in pre-approved list. Contact Admin.")));
    }
}
