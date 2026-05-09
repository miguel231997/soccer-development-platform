package com.soccerdev.season;

import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SeasonService {

    private final SeasonRepository seasonRepository;

    public List<SeasonResponse> list() {
        return seasonRepository.findAllByOrderByStartDateDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public SeasonResponse getActive() {
        return seasonRepository.findByActive(true)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("No active season found"));
    }

    @Transactional
    public SeasonResponse create(User user, SeasonRequest request) {
        requireEditor(user);
        if (request.isActive()) {
            deactivateCurrent();
        }
        Season season = Season.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.isActive())
                .build();
        return toResponse(seasonRepository.save(season));
    }

    @Transactional
    public SeasonResponse update(User user, Long id, SeasonRequest request) {
        requireEditor(user);
        Season season = findOrThrow(id);
        if (request.isActive() && !season.isActive()) {
            deactivateCurrent();
        }
        season.setName(request.getName());
        season.setStartDate(request.getStartDate());
        season.setEndDate(request.getEndDate());
        season.setActive(request.isActive());
        return toResponse(seasonRepository.save(season));
    }

    private void deactivateCurrent() {
        seasonRepository.findByActive(true).ifPresent(s -> {
            s.setActive(false);
            seasonRepository.save(s);
        });
    }

    private Season findOrThrow(Long id) {
        return seasonRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Season not found with id: " + id));
    }

    private void requireEditor(User user) {
        if (user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.DIRECTOR) {
            throw new AccessDeniedException("Access denied");
        }
    }

    private SeasonResponse toResponse(Season season) {
        return SeasonResponse.builder()
                .id(season.getId())
                .name(season.getName())
                .startDate(season.getStartDate())
                .endDate(season.getEndDate())
                .active(season.isActive())
                .build();
    }
}
