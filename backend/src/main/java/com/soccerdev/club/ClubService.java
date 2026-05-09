package com.soccerdev.club;

import com.soccerdev.security.AuthorizationService;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubService {

    private final ClubRepository clubRepository;
    private final AuthorizationService authorizationService;

    public List<ClubResponse> list(User user) {
        List<Club> clubs = switch (user.getRole()) {
            case ADMIN    -> clubRepository.findAll();
            case DIRECTOR -> user.getClub() != null
                    ? List.of(user.getClub())
                    : Collections.emptyList();
            case COACH    -> clubRepository.findByAssignedCoachId(user.getId());
            case PARENT   -> clubRepository.findByParentId(user.getId());
            case PLAYER   -> Collections.emptyList();
        };
        return clubs.stream().map(this::toResponse).toList();
    }

    public ClubResponse getById(User user, Long id) {
        Club club = findOrThrow(id);
        if (!authorizationService.canViewClub(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        return toResponse(club);
    }

    @Transactional
    public ClubResponse create(User user, ClubRequest request) {
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can create clubs");
        }
        Club club = Club.builder()
                .name(request.getName())
                .city(request.getCity())
                .state(request.getState())
                .build();
        return toResponse(clubRepository.save(club));
    }

    @Transactional
    public ClubResponse update(User user, Long id, ClubRequest request) {
        Club club = findOrThrow(id);
        if (!authorizationService.canEditClub(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        club.setName(request.getName());
        club.setCity(request.getCity());
        club.setState(request.getState());
        return toResponse(clubRepository.save(club));
    }

    @Transactional
    public void delete(User user, Long id) {
        findOrThrow(id);
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Only admins can delete clubs");
        }
        clubRepository.deleteById(id);
    }

    private Club findOrThrow(Long id) {
        return clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + id));
    }

    private ClubResponse toResponse(Club club) {
        return ClubResponse.builder()
                .id(club.getId())
                .name(club.getName())
                .city(club.getCity())
                .state(club.getState())
                .createdAt(club.getCreatedAt())
                .updatedAt(club.getUpdatedAt())
                .build();
    }
}
