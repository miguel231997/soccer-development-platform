package com.soccerdev.team;

import com.soccerdev.club.Club;
import com.soccerdev.club.ClubRepository;
import com.soccerdev.match.HomeAway;
import com.soccerdev.match.Match;
import com.soccerdev.match.MatchRepository;
import com.soccerdev.onboarding.TeamPlayerDto;
import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
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
public class TeamService {

    private final TeamRepository teamRepository;
    private final ClubRepository clubRepository;
    private final MatchRepository matchRepository;
    private final AuthorizationService authorizationService;
    private final TeamMembershipRepository teamMembershipRepository;
    private final PlayerRepository playerRepository;

    public List<TeamResponse> list(User user) {
        List<Team> teams = switch (user.getRole()) {
            case ADMIN    -> teamRepository.findAll();
            case DIRECTOR -> user.getClub() != null
                    ? teamRepository.findByClubId(user.getClub().getId())
                    : Collections.emptyList();
            case COACH    -> teamRepository.findByAssignedCoachId(user.getId());
            case PARENT   -> teamRepository.findByParentId(user.getId());
            case PLAYER   -> Collections.emptyList();
        };
        return teams.stream().map(this::toResponse).toList();
    }

    public TeamResponse getById(User user, Long id) {
        Team team = findOrThrow(id);
        if (!authorizationService.canViewTeam(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        return toResponse(team);
    }

    @Transactional
    public TeamResponse create(User user, TeamRequest request) {
        if (!authorizationService.canEditClub(user, request.getClubId())) {
            throw new AccessDeniedException("Access denied");
        }
        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + request.getClubId()));
        Team team = Team.builder()
                .club(club)
                .name(request.getName())
                .ageGroup(request.getAgeGroup())
                .gender(request.getGender())
                .competitiveLevel(request.getCompetitiveLevel())
                .build();
        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public TeamResponse update(User user, Long id, TeamRequest request) {
        Team team = findOrThrow(id);
        if (!authorizationService.canEditTeam(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new EntityNotFoundException("Club not found with id: " + request.getClubId()));
        team.setClub(club);
        team.setName(request.getName());
        team.setAgeGroup(request.getAgeGroup());
        team.setGender(request.getGender());
        team.setCompetitiveLevel(request.getCompetitiveLevel());
        return toResponse(teamRepository.save(team));
    }

    @Transactional
    public void delete(User user, Long id) {
        findOrThrow(id);
        if (!authorizationService.canEditTeam(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        teamRepository.deleteById(id);
    }

    public List<TeamResponse> listMyTeams(User user) {
        return teamMembershipRepository.findByUserId(user.getId()).stream()
                .map(tm -> toResponse(tm.getTeam()))
                .toList();
    }

    public List<TeamPlayerDto> listPlayersForTeam(User user, Long teamId) {
        Team team = findOrThrow(teamId);
        boolean isMember = teamMembershipRepository.existsByUserIdAndTeamId(user.getId(), teamId);
        boolean isStaff = user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.DIRECTOR;
        if (!isMember && !isStaff) {
            throw new AccessDeniedException("Access denied");
        }
        return playerRepository.findByTeamId(teamId).stream()
                .filter(Player::isActive)
                .map(p -> TeamPlayerDto.builder()
                        .id(p.getId())
                        .firstName(p.getFirstName())
                        .lastName(p.getLastName())
                        .primaryPosition(p.getPrimaryPosition() != null ? p.getPrimaryPosition().name() : null)
                        .jerseyNumber(p.getJerseyNumber())
                        .profileImageUrl(p.getProfileImageUrl())
                        .build())
                .toList();
    }

    private Team findOrThrow(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + id));
    }

    private TeamResponse toResponse(Team team) {
        int wins = 0, draws = 0, losses = 0;
        for (Match m : matchRepository.findScoredMatchesByTeamId(team.getId())) {
            int teamGoals = m.getHomeAway() == HomeAway.HOME ? m.getHomeScore() : m.getAwayScore();
            int oppGoals  = m.getHomeAway() == HomeAway.HOME ? m.getAwayScore() : m.getHomeScore();
            if (teamGoals > oppGoals) wins++;
            else if (teamGoals == oppGoals) draws++;
            else losses++;
        }
        return TeamResponse.builder()
                .id(team.getId())
                .clubId(team.getClub().getId())
                .clubName(team.getClub().getName())
                .name(team.getName())
                .ageGroup(team.getAgeGroup())
                .gender(team.getGender())
                .competitiveLevel(team.getCompetitiveLevel())
                .wins(wins)
                .draws(draws)
                .losses(losses)
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .build();
    }
}
