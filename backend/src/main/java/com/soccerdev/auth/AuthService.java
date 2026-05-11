package com.soccerdev.auth;

import com.soccerdev.onboarding.RegistrationCode;
import com.soccerdev.onboarding.RegistrationCodeRepository;
import com.soccerdev.security.JwtService;
import com.soccerdev.team.CoachTeamAssignment;
import com.soccerdev.team.CoachTeamAssignmentRepository;
import com.soccerdev.team.TeamMembership;
import com.soccerdev.team.TeamMembershipRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRepository;
import com.soccerdev.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final RegistrationCodeRepository registrationCodeRepository;
    private final CoachTeamAssignmentRepository coachTeamAssignmentRepository;
    private final TeamMembershipRepository teamMembershipRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        RegistrationCode code = registrationCodeRepository.findByCode(request.getRegistrationCode())
                .orElseThrow(() -> new IllegalArgumentException("Invalid registration code"));

        if (!code.isActive()) {
            throw new IllegalArgumentException("Registration code is no longer active");
        }
        if (code.getExpiresAt() != null && code.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Registration code has expired");
        }
        if (code.getMaxUses() != null && code.getUsesCount() >= code.getMaxUses()) {
            throw new IllegalArgumentException("Registration code has reached its maximum uses");
        }

        UserRole role = code.getRole();
        if (role != UserRole.COACH && role != UserRole.PARENT) {
            throw new IllegalArgumentException("Registration code grants an unsupported role");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .build();
        user = userRepository.save(user);

        teamMembershipRepository.save(TeamMembership.builder()
                .user(user)
                .team(code.getTeam())
                .role(role)
                .build());

        if (role == UserRole.COACH) {
            coachTeamAssignmentRepository.save(CoachTeamAssignment.builder()
                    .coachUser(user)
                    .team(code.getTeam())
                    .build());
        }

        code.setUsesCount(code.getUsesCount() + 1);
        registrationCodeRepository.save(code);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return toAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        return toAuthResponse(user, token);
    }

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return CurrentUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .build();
    }
}
